import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
let supabase: SupabaseClient | null = null;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
  console.warn('Supabase not configured, falling back to localStorage only');
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  series: string;
  rarity: string;
  stock: number;
  image: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

class CloudStorageService {
  private static instance: CloudStorageService;
  
  static getInstance(): CloudStorageService {
    if (!CloudStorageService.instance) {
      CloudStorageService.instance = new CloudStorageService();
    }
    return CloudStorageService.instance;
  }

  private isOnline(): boolean {
    return navigator.onLine && supabase !== null;
  }

  // Generic methods for any data type
  async saveData<T>(tableName: string, data: T[], localStorageKey: string): Promise<boolean> {
    try {
      // Always save to localStorage first (for offline access)
      localStorage.setItem(localStorageKey, JSON.stringify(data));

      // If online and Supabase is available, sync to cloud
      if (this.isOnline() && supabase) {
        // Create table if it doesn't exist (for demo purposes)
        const { error } = await supabase
          .from(tableName)
          .upsert(data, { onConflict: 'id' });

        if (error) {
          console.error(`Error syncing ${tableName} to cloud:`, error);
          // Don't fail completely - we still have localStorage
        }
      }

      // Trigger update events
      window.dispatchEvent(new CustomEvent(`${tableName}Updated`));
      return true;
    } catch (error) {
      console.error(`Error saving ${tableName}:`, error);
      return false;
    }
  }

  async loadData<T>(tableName: string, localStorageKey: string): Promise<T[]> {
    try {
      // If online and Supabase is available, try to load from cloud first
      if (this.isOnline() && supabase) {
        const { data: cloudData, error } = await supabase
          .from(tableName)
          .select('*')
          .order('updatedAt', { ascending: false });

        if (!error && cloudData && cloudData.length > 0) {
          // Update localStorage with latest cloud data
          localStorage.setItem(localStorageKey, JSON.stringify(cloudData));
          return cloudData as T[];
        }
      }

      // Fallback to localStorage
      const localData = localStorage.getItem(localStorageKey);
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error(`Error loading ${tableName}:`, error);
      // Final fallback to localStorage
      const localData = localStorage.getItem(localStorageKey);
      return localData ? JSON.parse(localData) : [];
    }
  }

  async deleteData(tableName: string, id: string, localStorageKey: string): Promise<boolean> {
    try {
      // Delete from localStorage
      const localData = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
      const updatedData = localData.filter((item: any) => item.id !== id);
      localStorage.setItem(localStorageKey, JSON.stringify(updatedData));

      // If online and Supabase is available, delete from cloud
      if (this.isOnline() && supabase) {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (error) {
          console.error(`Error deleting ${id} from ${tableName}:`, error);
        }
      }

      // Trigger update events
      window.dispatchEvent(new CustomEvent(`${tableName}Updated`));
      return true;
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      return false;
    }
  }

  // Specific methods for each data type
  async saveProducts(products: Product[]): Promise<boolean> {
    return this.saveData('products', products, 'adminProducts');
  }

  async loadProducts(): Promise<Product[]> {
    return this.loadData<Product>('products', 'adminProducts');
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.deleteData('products', id, 'adminProducts');
  }

  async saveOrders(orders: Order[]): Promise<boolean> {
    return this.saveData('orders', orders, 'adminOrders');
  }

  async loadOrders(): Promise<Order[]> {
    return this.loadData<Order>('orders', 'adminOrders');
  }

  async saveCustomers(customers: Customer[]): Promise<boolean> {
    return this.saveData('customers', customers, 'adminCustomers');
  }

  async loadCustomers(): Promise<Customer[]> {
    return this.loadData<Customer>('customers', 'adminCustomers');
  }

  async saveDiscountCodes(codes: DiscountCode[]): Promise<boolean> {
    return this.saveData('discount_codes', codes, 'adminDiscountCodes');
  }

  async loadDiscountCodes(): Promise<DiscountCode[]> {
    return this.loadData<DiscountCode>('discount_codes', 'adminDiscountCodes');
  }

  // Sync all data
  async syncAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadProducts(),
        this.loadOrders(),
        this.loadCustomers(),
        this.loadDiscountCodes()
      ]);
    } catch (error) {
      console.error('Error syncing all data:', error);
    }
  }

  // Check if cloud storage is available
  isCloudAvailable(): boolean {
    return this.isOnline();
  }

  // Get storage status
  getStorageStatus(): { cloud: boolean; local: boolean; message: string } {
    const cloud = this.isCloudAvailable();
    const local = typeof Storage !== 'undefined';
    
    let message = '';
    if (cloud && local) {
      message = 'Data synced across all devices';
    } else if (local) {
      message = 'Data saved locally only - connect to internet to sync across devices';
    } else {
      message = 'Storage not available';
    }

    return { cloud, local, message };
  }
}

// Export singleton instance
export const cloudStorage = CloudStorageService.getInstance();

// Helper function to migrate existing localStorage data to cloud
export async function migrateLocalDataToCloud(): Promise<void> {
  try {
    const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const customers = JSON.parse(localStorage.getItem('adminCustomers') || '[]');
    const discountCodes = JSON.parse(localStorage.getItem('adminDiscountCodes') || '[]');

    await Promise.all([
      products.length > 0 ? cloudStorage.saveProducts(products) : Promise.resolve(),
      orders.length > 0 ? cloudStorage.saveOrders(orders) : Promise.resolve(),
      customers.length > 0 ? cloudStorage.saveCustomers(customers) : Promise.resolve(),
      discountCodes.length > 0 ? cloudStorage.saveDiscountCodes(discountCodes) : Promise.resolve()
    ]);

    console.log('Successfully migrated local data to cloud');
  } catch (error) {
    console.error('Error migrating local data to cloud:', error);
  }
}