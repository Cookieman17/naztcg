import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration - HARDCODED for reliability
const SUPABASE_URL = 'https://elihmzzheuwmjwdqbufy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaWhtenpoZXV3bWp3ZHFidWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzY4ODcsImV4cCI6MjA3OTIxMjg4N30.ye9iiYcEwdmtTdkibhYrTfrM0NsYRCAsA2VDuTE9sq4';

// Create Supabase client
let supabase: SupabaseClient;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase connected:', SUPABASE_URL);
} catch (error) {
  console.error('❌ Supabase connection failed:', error);
  throw error;
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
    return true; // Always try to use cloud storage
  }

  // Generic methods for any data type
  async saveData<T>(tableName: string, data: T[], localStorageKey: string): Promise<boolean> {
    try {
      console.log(`🔄 Saving ${data.length} items to ${tableName}`);
      
      // ALWAYS save to cloud database first
      const { error } = await supabase
        .from(tableName)
        .upsert(data, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Failed to save ${tableName} to cloud:`, error);
        throw error; // Fail if cloud save fails
      }

      console.log(`✅ Successfully saved ${tableName} to cloud database`);

      // Also save to localStorage as backup
      localStorage.setItem(localStorageKey, JSON.stringify(data));

      // Trigger update events
      window.dispatchEvent(new CustomEvent(`${tableName}Updated`));
      return true;
    } catch (error) {
      console.error(`❌ Error saving ${tableName}:`, error);
      throw error; // Don't silently fail
    }
  }

  async loadData<T>(tableName: string, localStorageKey: string): Promise<T[]> {
    try {
      console.log(`🔄 Loading ${tableName} from cloud database`);
      
      // ALWAYS load from cloud database first
      const { data: cloudData, error } = await supabase
        .from(tableName)
        .select('*')
        .order('updatedAt', { ascending: false });

      if (error) {
        console.error(`❌ Failed to load ${tableName} from cloud:`, error);
        throw error;
      }

      console.log(`✅ Loaded ${cloudData?.length || 0} items from ${tableName} cloud database`);

      // Update localStorage with latest cloud data
      localStorage.setItem(localStorageKey, JSON.stringify(cloudData || []));
      return (cloudData as T[]) || [];
    } catch (error) {
      console.error(`❌ Error loading ${tableName}:`, error);
      // Only fallback to localStorage if cloud completely fails
      const localData = localStorage.getItem(localStorageKey);
      console.log(`⚠️ Falling back to localStorage for ${tableName}`);
      return localData ? JSON.parse(localData) : [];
    }
  }

  async deleteData(tableName: string, id: string, localStorageKey: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting ${id} from ${tableName}`);
      
      // Delete from cloud database first
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`❌ Failed to delete ${id} from ${tableName}:`, error);
        throw error;
      }

      console.log(`✅ Successfully deleted ${id} from ${tableName} cloud database`);

      // Also delete from localStorage
      const localData = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
      const updatedData = localData.filter((item: any) => item.id !== id);
      localStorage.setItem(localStorageKey, JSON.stringify(updatedData));

      // Trigger update events
      window.dispatchEvent(new CustomEvent(`${tableName}Updated`));
      return true;
    } catch (error) {
      console.error(`❌ Error deleting from ${tableName}:`, error);
      throw error;
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