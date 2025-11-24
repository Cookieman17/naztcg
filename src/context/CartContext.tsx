import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { firebaseCartService, CartItem } from '@/lib/firebase-cart';
import { Product } from '@/lib/products';

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
      // Use a default user ID for now - can be replaced with actual user auth later
      const cartData = await firebaseCartService.getCart('default-user');
      setItems(cartData?.items || []);
      console.log('🔥 Cart: Refreshed from Firebase:', cartData?.items?.length || 0, 'items');
    } catch (err) {
      console.error('🔥 Cart: Error loading from Firebase:', err);
      setError('Failed to load cart from Firebase');
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
      
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || '/placeholder.svg',
        quantity
      };
      
      await firebaseCartService.addToCart('default-user', cartItem);
      console.log('🔥 Cart: Added to Firebase cart:', product.name, 'x', quantity);
      await refreshCart();
    } catch (err: any) {
      console.error('🔥 Cart: Error adding to Firebase cart:', err);
      setError(err.message || 'Failed to add item to Firebase cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setError(null);
      setLoading(true);
      
      // Find the product ID from the cart item
      const cartItem = items.find(item => item.id === itemId);
      if (cartItem) {
        await firebaseCartService.updateItemQuantity('default-user', cartItem.productId, quantity);
        console.log('🔥 Cart: Updated quantity in Firebase:', cartItem.name, 'to', quantity);
      }
      
      await refreshCart();
    } catch (err: any) {
      console.error('🔥 Cart: Error updating quantity in Firebase:', err);
      setError(err.message || 'Failed to update item quantity in Firebase');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Find the product ID from the cart item
      const cartItem = items.find(item => item.id === itemId);
      if (cartItem) {
        await firebaseCartService.removeFromCart('default-user', cartItem.productId);
        console.log('🔥 Cart: Removed from Firebase cart:', cartItem.name);
      }
      
      await refreshCart();
    } catch (err: any) {
      console.error('🔥 Cart: Error removing from Firebase cart:', err);
      setError(err.message || 'Failed to remove item from Firebase cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      setLoading(true);
      await firebaseCartService.clearCart('default-user');
      console.log('🔥 Cart: Cleared Firebase cart');
      setItems([]);
    } catch (err: any) {
      console.error('🔥 Cart: Error clearing Firebase cart:', err);
      setError(err.message || 'Failed to clear Firebase cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
