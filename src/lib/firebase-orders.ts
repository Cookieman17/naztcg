import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Order {
  id: string;
  customerName: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

class FirebaseOrderService {
  private readonly collectionName = 'orders';

  /**
   * Get all orders with real-time updates
   */
  async getOrders(): Promise<Order[]> {
    try {
      const ordersRef = collection(db, this.collectionName);
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Order);
      });

      console.log('🔥 Orders: Loaded', orders.length, 'orders from Firebase');
      return orders;
    } catch (error) {
      console.error('🔥 Orders: Error loading from Firebase:', error);
      throw error;
    }
  }

  /**
   * Get a specific order by ID
   */
  async getOrder(id: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, this.collectionName, id);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const data = orderSnap.data();
        return {
          id: orderSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Order;
      }
      return null;
    } catch (error) {
      console.error('🔥 Orders: Error loading order:', error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      const now = Timestamp.now();
      const newOrder = {
        ...orderData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, this.collectionName), newOrder);
      console.log('🔥 Orders: Created order in Firebase:', docRef.id);
      
      return {
        id: docRef.id,
        ...orderData,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      };
    } catch (error) {
      console.error('🔥 Orders: Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update an existing order
   */
  async updateOrder(id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const orderRef = doc(db, this.collectionName, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(orderRef, updateData);
      console.log('🔥 Orders: Updated order in Firebase:', id);
    } catch (error) {
      console.error('🔥 Orders: Error updating order:', error);
      throw error;
    }
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<void> {
    try {
      const orderRef = doc(db, this.collectionName, id);
      await deleteDoc(orderRef);
      console.log('🔥 Orders: Deleted order from Firebase:', id);
    } catch (error) {
      console.error('🔥 Orders: Error deleting order:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time orders updates
   */
  subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    const ordersRef = collection(db, this.collectionName);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as Order);
      });
      
      console.log('🔥 Orders: Real-time update -', orders.length, 'orders');
      callback(orders);
    }, (error) => {
      console.error('🔥 Orders: Real-time subscription error:', error);
    });

    return unsubscribe;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    return this.updateOrder(id, { status });
  }

  /**
   * Get orders statistics
   */
  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    try {
      const orders = await this.getOrders();
      
      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        completedOrders: orders.filter(order => order.status === 'delivered').length,
      };
      
      console.log('🔥 Orders: Calculated stats:', stats);
      return stats;
    } catch (error) {
      console.error('🔥 Orders: Error calculating stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseOrderService = new FirebaseOrderService();