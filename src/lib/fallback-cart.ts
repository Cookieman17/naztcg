// Fallback cart service for localStorage
import { Product } from './supabase-simple';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

class FallbackCartService {
  private readonly STORAGE_KEY = 'naztcg_cart';
  
  async getCart() {
    const items = this.loadFromStorage();
    return {
      items: items,
      total: items.length
    };
  }
  
  async addToCart(productId: string, quantity: number = 1) {
    // This is a simplified version - in a real app you'd fetch the product
    throw new Error('Cart functionality requires product lookup - please use the admin interface to add sample products first');
  }
  
  async updateCartItem(itemId: string, quantity: number) {
    const items = this.loadFromStorage();
    const index = items.findIndex(item => item.id === itemId);
    
    if (index !== -1) {
      items[index].quantity = quantity;
      this.saveToStorage(items);
    }
  }
  
  async removeFromCart(itemId: string) {
    const items = this.loadFromStorage();
    const filteredItems = items.filter(item => item.id !== itemId);
    this.saveToStorage(filteredItems);
  }
  
  async clearCart() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  private loadFromStorage(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      return [];
    }
  }
  
  private saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }
}

export const fallbackCartService = new FallbackCartService();