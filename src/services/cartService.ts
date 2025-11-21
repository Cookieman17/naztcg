// services/cartService.ts - Complete cart management with persistence
import { supabase, Cart, CartItem, Product, ProductVariant } from '@/lib/supabase';
import { productService } from './productService';

export interface CartItemWithProduct extends CartItem {
  product?: Product;
  variant?: ProductVariant;
  displayName: string;
  displayPrice: number;
  displayImage?: string;
  isAvailable: boolean;
  maxQuantity: number;
}

export interface CartSummary {
  items: CartItemWithProduct[];
  subtotal: number;
  itemCount: number;
  totalQuantity: number;
}

export interface AddToCartData {
  productId?: string;
  variantId?: string;
  quantity: number;
}

class CartService {
  private sessionId: string;
  private cartId: string | null = null;

  constructor() {
    // Generate or get session ID
    this.sessionId = this.getOrCreateSessionId();
  }

  // Initialize cart for current session
  async initializeCart(customerId?: string): Promise<Cart> {
    try {
      // Try to find existing cart
      let { data: existingCart } = await supabase
        .from('carts')
        .select('*')
        .eq('session_id', this.sessionId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (existingCart) {
        this.cartId = existingCart.id;
        return existingCart;
      }

      // Create new cart
      const { data: newCart, error } = await supabase
        .from('carts')
        .insert({
          session_id: this.sessionId,
          customer_id: customerId,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single();

      if (error) throw error;

      this.cartId = newCart.id;
      return newCart;
    } catch (error) {
      console.error('Error initializing cart:', error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(data: AddToCartData): Promise<CartItemWithProduct> {
    try {
      if (!this.cartId) {
        await this.initializeCart();
      }

      // Check availability first
      const isAvailable = await productService.checkAvailability(
        data.productId,
        data.variantId,
        data.quantity
      );

      if (!isAvailable) {
        throw new Error('Product is not available in requested quantity');
      }

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', this.cartId!)
        .eq('product_id', data.productId || null)
        .eq('product_variant_id', data.variantId || null)
        .maybeSingle();

      let cartItem: CartItem;

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + data.quantity;

        // Check availability for new total quantity
        const canAddMore = await productService.checkAvailability(
          data.productId,
          data.variantId,
          newQuantity
        );

        if (!canAddMore) {
          throw new Error('Cannot add more items - insufficient stock');
        }

        const { data: updatedItem, error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        cartItem = updatedItem;
      } else {
        // Create new item
        const { data: newItem, error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: this.cartId!,
            product_id: data.productId,
            product_variant_id: data.variantId,
            quantity: data.quantity
          })
          .select()
          .single();

        if (error) throw error;
        cartItem = newItem;
      }

      // Return item with product details
      return await this.enrichCartItem(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number): Promise<CartItemWithProduct> {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(itemId);
      }

      // Get current item to check availability
      const { data: currentItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (!currentItem) {
        throw new Error('Cart item not found');
      }

      // Check availability for new quantity
      const isAvailable = await productService.checkAvailability(
        currentItem.product_id || undefined,
        currentItem.product_variant_id || undefined,
        quantity
      );

      if (!isAvailable) {
        throw new Error('Product is not available in requested quantity');
      }

      const { data: updatedItem, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      return await this.enrichCartItem(updatedItem);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(itemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Get full cart with all items
  async getCart(): Promise<CartSummary> {
    try {
      if (!this.cartId) {
        await this.initializeCart();
      }

      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', this.cartId!)
        .order('added_at', { ascending: true });

      if (error) throw error;

      // Enrich all items with product details
      const enrichedItems = await Promise.all(
        (cartItems || []).map(item => this.enrichCartItem(item))
      );

      // Calculate totals
      const subtotal = enrichedItems.reduce(
        (sum, item) => sum + (item.displayPrice * item.quantity),
        0
      );

      const itemCount = enrichedItems.length;
      const totalQuantity = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: enrichedItems,
        subtotal,
        itemCount,
        totalQuantity
      };
    } catch (error) {
      console.error('Error getting cart:', error);
      return {
        items: [],
        subtotal: 0,
        itemCount: 0,
        totalQuantity: 0
      };
    }
  }

  // Clear entire cart
  async clearCart(): Promise<void> {
    try {
      if (!this.cartId) return;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', this.cartId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Validate cart before checkout (check availability, remove unavailable items)
  async validateCart(): Promise<{
    isValid: boolean;
    removedItems: string[];
    updatedItems: string[];
    cart: CartSummary;
  }> {
    try {
      const cart = await this.getCart();
      const removedItems: string[] = [];
      const updatedItems: string[] = [];

      for (const item of cart.items) {
        if (!item.isAvailable) {
          // Remove unavailable items
          await this.removeFromCart(item.id);
          removedItems.push(item.displayName);
        } else if (item.quantity > item.maxQuantity) {
          // Update items exceeding max quantity
          await this.updateCartItem(item.id, item.maxQuantity);
          updatedItems.push(`${item.displayName} (reduced to ${item.maxQuantity})`);
        }
      }

      // Get updated cart
      const updatedCart = await this.getCart();

      return {
        isValid: removedItems.length === 0 && updatedItems.length === 0,
        removedItems,
        updatedItems,
        cart: updatedCart
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      throw error;
    }
  }

  // Reserve all cart items (call before payment)
  async reserveCartItems(): Promise<boolean> {
    try {
      const cart = await this.getCart();
      
      for (const item of cart.items) {
        const success = await productService.reserveStock(
          item.product_id || undefined,
          item.product_variant_id || undefined,
          item.quantity,
          this.cartId
        );

        if (!success) {
          // If any reservation fails, release all previous reservations
          await this.releaseCartItems();
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error reserving cart items:', error);
      return false;
    }
  }

  // Release all cart items (call if payment fails)
  async releaseCartItems(): Promise<void> {
    try {
      const cart = await this.getCart();
      
      for (const item of cart.items) {
        await productService.releaseStock(
          item.product_id || undefined,
          item.product_variant_id || undefined,
          item.quantity,
          this.cartId
        );
      }
    } catch (error) {
      console.error('Error releasing cart items:', error);
    }
  }

  // Merge carts when customer logs in
  async mergeCarts(customerCartId: string): Promise<void> {
    try {
      if (!this.cartId || this.cartId === customerCartId) return;

      // Get items from both carts
      const { data: sessionItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', this.cartId);

      if (!sessionItems || sessionItems.length === 0) return;

      // Move session items to customer cart, merging quantities where needed
      for (const item of sessionItems) {
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('*')
          .eq('cart_id', customerCartId)
          .eq('product_id', item.product_id || null)
          .eq('product_variant_id', item.product_variant_id || null)
          .maybeSingle();

        if (existingItem) {
          // Merge with existing item
          await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq('id', existingItem.id);
        } else {
          // Move item to customer cart
          await supabase
            .from('cart_items')
            .update({ cart_id: customerCartId })
            .eq('id', item.id);
        }
      }

      // Clean up session cart
      await this.clearCart();
      this.cartId = customerCartId;
    } catch (error) {
      console.error('Error merging carts:', error);
      throw error;
    }
  }

  // Private: Enrich cart item with product details
  private async enrichCartItem(item: CartItem): Promise<CartItemWithProduct> {
    try {
      let product: Product | null = null;
      let variant: ProductVariant | null = null;
      let displayName = 'Unknown Product';
      let displayPrice = 0;
      let displayImage: string | undefined;
      let isAvailable = false;
      let maxQuantity = 0;

      if (item.product_variant_id) {
        // Get variant and its product
        const { data: variantData } = await supabase
          .from('product_variants')
          .select(`
            *,
            product:products(*)
          `)
          .eq('id', item.product_variant_id)
          .single();

        if (variantData) {
          variant = variantData;
          product = variantData.product as Product;
          displayName = `${product.name}${variant.grade ? ` (Grade ${variant.grade})` : ''}`;
          displayPrice = variant.price;
          displayImage = product.image_url;
          isAvailable = variant.status === 'available' && variant.stock_quantity > 0;
          maxQuantity = variant.stock_quantity;
        }
      } else if (item.product_id) {
        // Get product only
        const { data: productData } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .single();

        if (productData) {
          product = productData;
          displayName = product.name;
          displayPrice = product.base_price;
          displayImage = product.image_url;
          isAvailable = product.status === 'active' && product.stock_quantity > 0;
          maxQuantity = product.stock_quantity;
        }
      }

      return {
        ...item,
        product: product || undefined,
        variant: variant || undefined,
        displayName,
        displayPrice,
        displayImage,
        isAvailable,
        maxQuantity
      };
    } catch (error) {
      console.error('Error enriching cart item:', error);
      return {
        ...item,
        displayName: 'Error Loading Product',
        displayPrice: 0,
        isAvailable: false,
        maxQuantity: 0
      };
    }
  }

  // Private: Get or create session ID
  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('naz_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('naz_session_id', sessionId);
    }
    return sessionId;
  }

  // Get cart item count for header display
  async getCartItemCount(): Promise<number> {
    try {
      if (!this.cartId) {
        await this.initializeCart();
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('cart_id', this.cartId!);

      if (error) return 0;

      return (data || []).reduce((sum, item) => sum + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const cartService = new CartService();