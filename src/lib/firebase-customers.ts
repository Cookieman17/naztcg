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

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  status: 'active' | 'inactive';
  orders: CustomerOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrder {
  id: string;
  total: number;
  date: string;
  status: string;
}

class FirebaseCustomerService {
  private readonly collectionName = 'customers';

  /**
   * Get all customers with real-time updates
   */
  async getCustomers(): Promise<Customer[]> {
    try {
      const customersRef = collection(db, this.collectionName);
      const q = query(customersRef, orderBy('lastOrderDate', 'desc'));
      const snapshot = await getDocs(q);
      
      const customers: Customer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        customers.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          firstOrderDate: data.firstOrderDate?.toDate?.()?.toISOString() || data.firstOrderDate,
          lastOrderDate: data.lastOrderDate?.toDate?.()?.toISOString() || data.lastOrderDate,
        } as Customer);
      });

      console.log('🔥 Customers: Loaded', customers.length, 'customers from Firebase');
      return customers;
    } catch (error) {
      console.error('🔥 Customers: Error loading from Firebase:', error);
      throw error;
    }
  }

  /**
   * Get a specific customer by ID
   */
  async getCustomer(id: string): Promise<Customer | null> {
    try {
      const customerRef = doc(db, this.collectionName, id);
      const customerSnap = await getDoc(customerRef);
      
      if (customerSnap.exists()) {
        const data = customerSnap.data();
        return {
          id: customerSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          firstOrderDate: data.firstOrderDate?.toDate?.()?.toISOString() || data.firstOrderDate,
          lastOrderDate: data.lastOrderDate?.toDate?.()?.toISOString() || data.lastOrderDate,
        } as Customer;
      }
      return null;
    } catch (error) {
      console.error('🔥 Customers: Error loading customer:', error);
      throw error;
    }
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      const customers = await this.getCustomers();
      return customers.find(customer => customer.email === email) || null;
    } catch (error) {
      console.error('🔥 Customers: Error finding customer by email:', error);
      throw error;
    }
  }

  /**
   * Create a new customer
   */
  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      const now = Timestamp.now();
      const newCustomer = {
        ...customerData,
        createdAt: now,
        updatedAt: now,
        firstOrderDate: customerData.firstOrderDate ? Timestamp.fromDate(new Date(customerData.firstOrderDate)) : now,
        lastOrderDate: customerData.lastOrderDate ? Timestamp.fromDate(new Date(customerData.lastOrderDate)) : now,
      };

      const docRef = await addDoc(collection(db, this.collectionName), newCustomer);
      console.log('🔥 Customers: Created customer in Firebase:', docRef.id);
      
      return {
        id: docRef.id,
        ...customerData,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      };
    } catch (error) {
      console.error('🔥 Customers: Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const customerRef = doc(db, this.collectionName, id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      // Convert date strings to Timestamps if provided
      if (updates.firstOrderDate) {
        updateData.firstOrderDate = Timestamp.fromDate(new Date(updates.firstOrderDate));
      }
      if (updates.lastOrderDate) {
        updateData.lastOrderDate = Timestamp.fromDate(new Date(updates.lastOrderDate));
      }
      
      await updateDoc(customerRef, updateData);
      console.log('🔥 Customers: Updated customer in Firebase:', id);
    } catch (error) {
      console.error('🔥 Customers: Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Update customer when new order is placed
   */
  async updateCustomerFromOrder(orderData: {
    email: string;
    customerName: string;
    orderId: string;
    orderTotal: number;
    orderDate: string;
    orderStatus: string;
  }): Promise<void> {
    try {
      const existingCustomer = await this.getCustomerByEmail(orderData.email);
      
      if (existingCustomer) {
        // Update existing customer
        const updatedOrders = [...existingCustomer.orders, {
          id: orderData.orderId,
          total: orderData.orderTotal,
          date: orderData.orderDate,
          status: orderData.orderStatus,
        }];

        await this.updateCustomer(existingCustomer.id, {
          totalOrders: existingCustomer.totalOrders + 1,
          totalSpent: existingCustomer.totalSpent + orderData.orderTotal,
          lastOrderDate: orderData.orderDate,
          orders: updatedOrders,
          status: 'active',
        });
        
        console.log('🔥 Customers: Updated existing customer:', orderData.email);
      } else {
        // Create new customer
        await this.createCustomer({
          name: orderData.customerName || orderData.email,
          email: orderData.email,
          totalOrders: 1,
          totalSpent: orderData.orderTotal,
          firstOrderDate: orderData.orderDate,
          lastOrderDate: orderData.orderDate,
          status: 'active',
          orders: [{
            id: orderData.orderId,
            total: orderData.orderTotal,
            date: orderData.orderDate,
            status: orderData.orderStatus,
          }],
        });
        
        console.log('🔥 Customers: Created new customer:', orderData.email);
      }
    } catch (error) {
      console.error('🔥 Customers: Error updating customer from order:', error);
      throw error;
    }
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(id: string): Promise<void> {
    try {
      const customerRef = doc(db, this.collectionName, id);
      await deleteDoc(customerRef);
      console.log('🔥 Customers: Deleted customer from Firebase:', id);
    } catch (error) {
      console.error('🔥 Customers: Error deleting customer:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time customers updates
   */
  subscribeToCustomers(callback: (customers: Customer[]) => void): () => void {
    const customersRef = collection(db, this.collectionName);
    const q = query(customersRef, orderBy('lastOrderDate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customers: Customer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        customers.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          firstOrderDate: data.firstOrderDate?.toDate?.()?.toISOString() || data.firstOrderDate,
          lastOrderDate: data.lastOrderDate?.toDate?.()?.toISOString() || data.lastOrderDate,
        } as Customer);
      });
      
      console.log('🔥 Customers: Real-time update -', customers.length, 'customers');
      callback(customers);
    }, (error) => {
      console.error('🔥 Customers: Real-time subscription error:', error);
    });

    return unsubscribe;
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    averageOrderValue: number;
    topCustomers: Customer[];
  }> {
    try {
      const customers = await this.getCustomers();
      
      const activeCustomers = customers.filter(customer => customer.status === 'active');
      const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
      const totalOrders = customers.reduce((sum, customer) => sum + customer.totalOrders, 0);
      
      const stats = {
        totalCustomers: customers.length,
        activeCustomers: activeCustomers.length,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        topCustomers: customers
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 5),
      };
      
      console.log('🔥 Customers: Calculated stats:', stats);
      return stats;
    } catch (error) {
      console.error('🔥 Customers: Error calculating stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseCustomerService = new FirebaseCustomerService();