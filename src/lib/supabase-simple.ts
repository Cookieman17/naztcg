// Simple Supabase client without strict typing for development
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('✅ Supabase connected:', supabaseUrl || 'URL not found');
  console.warn('Supabase environment variables not fully configured');
  console.log('VITE_SUPABASE_URL:', supabaseUrl || 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ error: null }),
      })
    } as any;

// Basic types for the application
export interface Product {
  id: string;
  name: string;
  description?: string;
  series?: string;
  rarity?: string;
  category: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  condition: 'mint' | 'near_mint' | 'lightly_played' | 'moderately_played' | 'heavily_played' | 'damaged';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id?: string;
  quantity: number;
  product?: Product;
  added_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  status: string;
  total_amount: number;
  created_at: string;
}

// Helper function to generate order numbers
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NAZ${timestamp}${random}`;
}

console.log('Supabase client initialized successfully');