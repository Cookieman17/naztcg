// lib/supabase.ts - Enhanced Supabase client with proper typing
import { createClient } from '@supabase/supabase-js'

// Database types based on our schema
export interface Product {
  id: string;
  name: string;
  description?: string;
  series: string;
  set_name?: string;
  rarity: string;
  category: string;
  base_price: number;
  image_url?: string;
  stock_quantity: number;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  grade?: number;
  serial_number?: string;
  condition?: string;
  price: number;
  stock_quantity: number;
  status: 'available' | 'sold' | 'reserved';
  created_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  payment_intent_id?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  billing_address: any;
  shipping_address: any;
  shipping_method?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_variant_id?: string;
  product_name: string;
  product_image?: string;
  grade?: number;
  serial_number?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_order_amount: number;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface Cart {
  id: string;
  session_id: string;
  customer_id?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id?: string;
  product_variant_id?: string;
  quantity: number;
  added_at: string;
}

export interface InventoryLogEntry {
  id: string;
  product_id?: string;
  product_variant_id?: string;
  change_type: 'restock' | 'sale' | 'adjustment' | 'reserve' | 'release';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

// Database schema type for TypeScript
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Omit<ProductVariant, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductVariant, 'id' | 'created_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>;
      };
      customer_addresses: {
        Row: CustomerAddress;
        Insert: Omit<CustomerAddress, 'id' | 'created_at'>;
        Update: Partial<Omit<CustomerAddress, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
      };
      discount_codes: {
        Row: DiscountCode;
        Insert: Omit<DiscountCode, 'id' | 'created_at'>;
        Update: Partial<Omit<DiscountCode, 'id' | 'created_at'>>;
      };
      carts: {
        Row: Cart;
        Insert: Omit<Cart, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Cart, 'id' | 'created_at' | 'updated_at'>>;
      };
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, 'id' | 'added_at'>;
        Update: Partial<Omit<CartItem, 'id' | 'added_at'>>;
      };
      inventory_log: {
        Row: InventoryLogEntry;
        Insert: Omit<InventoryLogEntry, 'id' | 'created_at'>;
        Update: Partial<Omit<InventoryLogEntry, 'id' | 'created_at'>>;
      };
    };
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to generate order numbers
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NAZ${timestamp}${random}`;
}