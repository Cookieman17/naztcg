import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fallbackCartService, CartItem } from '@/lib/fallback-cart';
import { Product } from '@/lib/supabase-simple';

type EnrichedCartItem = CartItem;

type CartContextValue = {
  items: EnrichedCartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<EnrichedCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    try {
      setError(null);
      const cartData = await fallbackCartService.getCart();
      setItems(cartData.items);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      setError(null);
      setLoading(true);
      await fallbackCartService.addToCart(product.id, quantity);
      await refreshCart();
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      setError(err.message || 'Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setError(null);
      setLoading(true);
      await fallbackCartService.updateCartItem(itemId, quantity);
      await refreshCart();
    } catch (err: any) {
      console.error('Error updating cart:', err);
      setError(err.message || 'Failed to update item quantity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setError(null);
      setLoading(true);
      await fallbackCartService.removeFromCart(itemId);
      await refreshCart();
    } catch (err: any) {
      console.error('Error removing from cart:', err);
      setError(err.message || 'Failed to remove item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      setLoading(true);
      await fallbackCartService.clearCart();
      setItems([]);
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      setError(err.message || 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      updateQuantity,
      removeFromCart, 
      clearCart, 
      totalItems,
      totalAmount,
      loading,
      error,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
