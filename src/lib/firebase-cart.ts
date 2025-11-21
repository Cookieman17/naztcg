// Firebase Firestore service for cart management
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  createdAt: string;
}

export interface Cart {
  id?: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

const CARTS_COLLECTION = 'carts';

class FirebaseCartService {
  private listeners: (() => void)[] = [];

  // Get user's cart
  async getCart(userId: string): Promise<Cart | null> {
    try {
      console.log('🔥 Firebase Cart: Getting cart for user:', userId);
      const cartsRef = collection(db, CARTS_COLLECTION);
      const q = query(cartsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const cartDoc = querySnapshot.docs[0];
        const cart = { id: cartDoc.id, ...cartDoc.data() } as Cart;
        console.log('🔥 Firebase Cart: Retrieved cart with items:', cart.items.length);
        return cart;
      } else {
        console.log('🔥 Firebase Cart: No cart found for user');
        return null;
      }
    } catch (error) {
      console.error('🔥 Firebase Cart: Error getting cart:', error);
      throw error;
    }
  }

  // Create new cart
  async createCart(userId: string): Promise<Cart> {
    try {
      console.log('🔥 Firebase Cart: Creating new cart for user:', userId);
      const cartsRef = collection(db, CARTS_COLLECTION);
      const cartData = {
        userId,
        items: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(cartsRef, cartData);
      
      const newCart: Cart = {
        id: docRef.id,
        userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('🔥 Firebase Cart: Cart created successfully:', newCart.id);
      return newCart;
    } catch (error) {
      console.error('🔥 Firebase Cart: Error creating cart:', error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(userId: string, item: Omit<CartItem, 'id' | 'createdAt'>): Promise<void> {
    try {
      console.log('🔥 Firebase Cart: Adding item to cart:', item.name);
      
      let cart = await this.getCart(userId);
      if (!cart) {
        cart = await this.createCart(userId);
      }

      const existingItemIndex = cart.items.findIndex(
        cartItem => cartItem.productId === item.productId
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        cart.items[existingItemIndex].quantity += item.quantity;
        console.log('🔥 Firebase Cart: Updated existing item quantity');
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        };
        cart.items.push(newItem);
        console.log('🔥 Firebase Cart: Added new item to cart');
      }

      await this.updateCart(cart.id!, cart.items);
      this.notifyListeners();
    } catch (error) {
      console.error('🔥 Firebase Cart: Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart items
  async updateCart(cartId: string, items: CartItem[]): Promise<void> {
    try {
      console.log('🔥 Firebase Cart: Updating cart items:', items.length);
      const cartRef = doc(db, CARTS_COLLECTION, cartId);
      await updateDoc(cartRef, {
        items,
        updatedAt: serverTimestamp()
      });
      console.log('🔥 Firebase Cart: Cart updated successfully');
      this.notifyListeners();
    } catch (error) {
      console.error('🔥 Firebase Cart: Error updating cart:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(userId: string, productId: string): Promise<void> {
    try {
      console.log('🔥 Firebase Cart: Removing item from cart:', productId);
      const cart = await this.getCart(userId);
      
      if (cart) {
        const updatedItems = cart.items.filter(item => item.productId !== productId);
        await this.updateCart(cart.id!, updatedItems);
        console.log('🔥 Firebase Cart: Item removed successfully');
      }
    } catch (error) {
      console.error('🔥 Firebase Cart: Error removing from cart:', error);
      throw error;
    }
  }

  // Update item quantity
  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<void> {
    try {
      console.log('🔥 Firebase Cart: Updating item quantity:', productId, quantity);
      const cart = await this.getCart(userId);
      
      if (cart) {
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex >= 0) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.items.splice(itemIndex, 1);
          } else {
            cart.items[itemIndex].quantity = quantity;
          }
          await this.updateCart(cart.id!, cart.items);
          console.log('🔥 Firebase Cart: Item quantity updated');
        }
      }
    } catch (error) {
      console.error('🔥 Firebase Cart: Error updating quantity:', error);
      throw error;
    }
  }

  // Clear cart
  async clearCart(userId: string): Promise<void> {
    try {
      console.log('🔥 Firebase Cart: Clearing cart for user:', userId);
      const cart = await this.getCart(userId);
      
      if (cart) {
        await this.updateCart(cart.id!, []);
        console.log('🔥 Firebase Cart: Cart cleared successfully');
      }
    } catch (error) {
      console.error('🔥 Firebase Cart: Error clearing cart:', error);
      throw error;
    }
  }

  // Get cart total
  async getCartTotal(userId: string): Promise<number> {
    try {
      const cart = await this.getCart(userId);
      if (!cart) return 0;
      
      const total = cart.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      
      console.log('🔥 Firebase Cart: Calculated total:', total);
      return total;
    } catch (error) {
      console.error('🔥 Firebase Cart: Error calculating total:', error);
      throw error;
    }
  }

  // Get cart item count
  async getCartItemCount(userId: string): Promise<number> {
    try {
      const cart = await this.getCart(userId);
      if (!cart) return 0;
      
      const count = cart.items.reduce(
        (sum, item) => sum + item.quantity, 
        0
      );
      
      console.log('🔥 Firebase Cart: Item count:', count);
      return count;
    } catch (error) {
      console.error('🔥 Firebase Cart: Error getting item count:', error);
      throw error;
    }
  }

  // Add listener
  addListener(callback: () => void): void {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback: () => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('🔥 Firebase Cart: Error in listener callback:', error);
      }
    });
  }

  // Check if Firebase is available
  async isAvailable(): Promise<boolean> {
    try {
      const testRef = collection(db, 'test');
      await getDocs(testRef);
      return true;
    } catch (error) {
      console.error('🔥 Firebase Cart: Availability check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const firebaseCartService = new FirebaseCartService();

// Export for direct use
export default firebaseCartService;