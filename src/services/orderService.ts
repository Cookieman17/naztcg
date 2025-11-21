// services/orderService.ts - Complete order and payment processing
import { supabase, Order, OrderItem, Customer, generateOrderNumber } from '@/lib/supabase';
import { cartService, CartSummary } from './cartService';
import { productService } from './productService';

export interface CreateOrderData {
  email: string;
  billing_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shipping_address: {
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  shipping_method?: string;
  discount_code?: string;
  notes?: string;
}

export interface OrderSummary {
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
}

export interface PaymentIntent {
  client_secret: string;
  amount: number;
  currency: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  customer?: Customer;
}

// Tax rates by state (simplified - in production, use tax service)
const TAX_RATES: { [state: string]: number } = {
  'CA': 0.0875, // California
  'NY': 0.08,   // New York
  'TX': 0.0625, // Texas
  'FL': 0.06,   // Florida
  'WA': 0.065,  // Washington
  // Add more states as needed
  'DEFAULT': 0.0875 // Default rate
};

// Shipping rates by method
const SHIPPING_RATES = {
  'standard': 9.99,
  'expedited': 19.99,
  'overnight': 39.99,
  'free': 0
};

class OrderService {
  // Calculate order totals
  async calculateOrderSummary(
    cart: CartSummary,
    shippingState: string,
    shippingMethod: string = 'standard',
    discountCode?: string
  ): Promise<OrderSummary> {
    try {
      const subtotal = cart.subtotal;
      
      // Calculate tax
      const taxRate = TAX_RATES[shippingState.toUpperCase()] || TAX_RATES.DEFAULT;
      const tax_amount = Number((subtotal * taxRate).toFixed(2));
      
      // Calculate shipping
      let shipping_amount = SHIPPING_RATES[shippingMethod as keyof typeof SHIPPING_RATES] || SHIPPING_RATES.standard;
      
      // Free shipping over $200
      if (subtotal >= 200) {
        shipping_amount = 0;
      }
      
      // Calculate discount
      let discount_amount = 0;
      if (discountCode) {
        discount_amount = await this.calculateDiscount(discountCode, subtotal);
      }
      
      const total_amount = Number((subtotal + tax_amount + shipping_amount - discount_amount).toFixed(2));
      
      return {
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        total_amount
      };
    } catch (error) {
      console.error('Error calculating order summary:', error);
      throw error;
    }
  }

  // Create Stripe Payment Intent
  async createPaymentIntent(orderData: CreateOrderData): Promise<PaymentIntent> {
    try {
      // Get current cart
      const cart = await cartService.getCart();
      
      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate cart and reserve items
      const validation = await cartService.validateCart();
      if (!validation.isValid) {
        throw new Error('Some items in your cart are no longer available');
      }

      const reserved = await cartService.reserveCartItems();
      if (!reserved) {
        throw new Error('Unable to reserve items - please try again');
      }

      // Calculate totals
      const summary = await this.calculateOrderSummary(
        validation.cart,
        orderData.shipping_address.state,
        orderData.shipping_method,
        orderData.discount_code
      );

      // Create payment intent with Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(summary.total_amount * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            customer_email: orderData.email,
            item_count: validation.cart.itemCount,
            total_quantity: validation.cart.totalQuantity
          }
        }),
      });

      if (!response.ok) {
        // Release reserved items if payment intent creation fails
        await cartService.releaseCartItems();
        throw new Error('Failed to create payment intent');
      }

      const { client_secret } = await response.json();

      return {
        client_secret,
        amount: summary.total_amount,
        currency: 'usd'
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      // Release reserved items on error
      await cartService.releaseCartItems();
      throw error;
    }
  }

  // Create order after successful payment
  async createOrder(orderData: CreateOrderData, paymentIntentId: string): Promise<Order> {
    try {
      // Get current cart
      const cart = await cartService.getCart();
      
      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Calculate final totals
      const summary = await this.calculateOrderSummary(
        cart,
        orderData.shipping_address.state,
        orderData.shipping_method,
        orderData.discount_code
      );

      // Find or create customer
      let customer: Customer | null = null;
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', orderData.email)
        .maybeSingle();

      if (existingCustomer) {
        customer = existingCustomer;
      } else {
        // Create new customer
        const { data: newCustomer, error } = await supabase
          .from('customers')
          .insert({
            email: orderData.email,
            first_name: orderData.billing_address.first_name,
            last_name: orderData.billing_address.last_name
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating customer:', error);
        } else {
          customer = newCustomer;
        }
      }

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customer?.id,
          email: orderData.email,
          status: 'processing',
          payment_status: 'paid',
          payment_intent_id: paymentIntentId,
          subtotal: summary.subtotal,
          tax_amount: summary.tax_amount,
          shipping_amount: summary.shipping_amount,
          discount_amount: summary.discount_amount,
          total_amount: summary.total_amount,
          currency: 'USD',
          billing_address: orderData.billing_address,
          shipping_address: orderData.shipping_address,
          shipping_method: orderData.shipping_method,
          notes: orderData.notes
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      // Create order items
      for (const cartItem of cart.items) {
        await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: cartItem.product_id,
            product_variant_id: cartItem.product_variant_id,
            product_name: cartItem.displayName,
            product_image: cartItem.displayImage,
            grade: cartItem.variant?.grade,
            serial_number: cartItem.variant?.serial_number,
            quantity: cartItem.quantity,
            unit_price: cartItem.displayPrice,
            total_price: cartItem.displayPrice * cartItem.quantity
          });

        // Log inventory sale
        await productService.reserveStock(
          cartItem.product_id || undefined,
          cartItem.product_variant_id || undefined,
          cartItem.quantity,
          order.id
        );
      }

      // Update discount code usage if applicable
      if (orderData.discount_code) {
        await this.useDiscountCode(orderData.discount_code);
      }

      // Clear cart after successful order
      await cartService.clearCart();

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(id: string): Promise<OrderWithItems | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          customer:customers(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return order as OrderWithItems;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          customer:customers(*)
        `)
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return order as OrderWithItems;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  // Admin: Get all orders with pagination
  async getOrders(
    page: number = 1,
    limit: number = 20,
    status?: string,
    paymentStatus?: string
  ): Promise<{ orders: OrderWithItems[]; total: number; hasMore: boolean }> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          customer:customers(*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (paymentStatus) {
        query = query.eq('payment_status', paymentStatus);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: orders, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        orders: (orders as OrderWithItems[]) || [],
        total: count || 0,
        hasMore: (count || 0) > to + 1
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { orders: [], total: 0, hasMore: false };
    }
  }

  // Admin: Update order status
  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Admin: Add tracking number
  async addTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          status: 'shipped'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error adding tracking number:', error);
      throw error;
    }
  }

  // Validate discount code
  async validateDiscountCode(code: string, subtotal: number): Promise<{
    isValid: boolean;
    discount?: number;
    message?: string;
  }> {
    try {
      const { data: discountCode, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !discountCode) {
        return { isValid: false, message: 'Invalid discount code' };
      }

      const now = new Date();
      
      // Check if code has started
      if (discountCode.starts_at && new Date(discountCode.starts_at) > now) {
        return { isValid: false, message: 'Discount code is not yet active' };
      }

      // Check if code has expired
      if (discountCode.expires_at && new Date(discountCode.expires_at) < now) {
        return { isValid: false, message: 'Discount code has expired' };
      }

      // Check usage limit
      if (discountCode.usage_limit && discountCode.usage_count >= discountCode.usage_limit) {
        return { isValid: false, message: 'Discount code has reached its usage limit' };
      }

      // Check minimum order amount
      if (subtotal < discountCode.minimum_order_amount) {
        return { 
          isValid: false, 
          message: `Minimum order amount of $${discountCode.minimum_order_amount} required` 
        };
      }

      // Calculate discount
      const discount = this.calculateDiscountAmount(discountCode, subtotal);

      return { 
        isValid: true, 
        discount,
        message: `${discountCode.description || 'Discount applied'}`
      };
    } catch (error) {
      console.error('Error validating discount code:', error);
      return { isValid: false, message: 'Error validating discount code' };
    }
  }

  // Private: Calculate discount amount
  private calculateDiscountAmount(discountCode: any, subtotal: number): number {
    if (discountCode.type === 'percentage') {
      return Number((subtotal * (discountCode.value / 100)).toFixed(2));
    } else {
      return Math.min(discountCode.value, subtotal);
    }
  }

  // Private: Calculate discount (used in order summary)
  private async calculateDiscount(code: string, subtotal: number): Promise<number> {
    const validation = await this.validateDiscountCode(code, subtotal);
    return validation.isValid ? validation.discount || 0 : 0;
  }

  // Private: Use discount code (increment usage count)
  private async useDiscountCode(code: string): Promise<void> {
    try {
      await supabase.rpc('increment_discount_usage', { discount_code: code.toUpperCase() });
    } catch (error) {
      console.error('Error using discount code:', error);
    }
  }

  // Get customer orders
  async getCustomerOrders(email: string): Promise<OrderWithItems[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*),
          customer:customers(*)
        `)
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (orders as OrderWithItems[]) || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();