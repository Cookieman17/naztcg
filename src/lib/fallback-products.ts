// Fallback product management for when Supabase is not available
import { Product } from './supabase-simple';

interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  category: string;
  series?: string;
  rarity?: string;
  stock_quantity: number;
  image_url?: string;
  condition: 'mint' | 'near_mint' | 'lightly_played' | 'moderately_played' | 'heavily_played' | 'damaged';
  status: 'active' | 'inactive';
}

class FallbackProductService {
  private readonly STORAGE_KEY = 'naztcg_products';
  
  async getProducts(filters?: {
    category?: string;
    series?: string;
    status?: 'active' | 'inactive';
    inStock?: boolean;
    includeInactive?: boolean;
  }) {
    const products = this.loadFromStorage();
    
    let filteredProducts = products;
    
    if (filters) {
      if (filters.status) {
        filteredProducts = filteredProducts.filter(p => p.status === filters.status);
      }
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      if (filters.series) {
        filteredProducts = filteredProducts.filter(p => p.series === filters.series);
      }
      if (filters.inStock) {
        filteredProducts = filteredProducts.filter(p => p.stock_quantity > 0);
      }
      if (!filters.includeInactive) {
        filteredProducts = filteredProducts.filter(p => p.status === 'active');
      }
    }
    
    return {
      products: filteredProducts,
      total: filteredProducts.length,
      page: 1,
      limit: filteredProducts.length
    };
  }
  
  async getProductById(id: string): Promise<Product | null> {
    const products = this.loadFromStorage();
    return products.find(p => p.id === id) || null;
  }
  
  async createProduct(productData: CreateProductData): Promise<Product> {
    const products = this.loadFromStorage();
    
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    products.push(newProduct);
    this.saveToStorage(products);
    
    return newProduct;
  }
  
  async updateProduct(id: string, updates: Partial<CreateProductData>): Promise<Product | null> {
    const products = this.loadFromStorage();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    products[index] = {
      ...products[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    this.saveToStorage(products);
    return products[index];
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    const products = this.loadFromStorage();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) return false;
    
    this.saveToStorage(filteredProducts);
    return true;
  }
  
  private loadFromStorage(): Product[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading products from storage:', error);
      return [];
    }
  }
  
  private saveToStorage(products: Product[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('productsUpdated'));
    } catch (error) {
      console.error('Error saving products to storage:', error);
    }
  }
}

export const fallbackProductService = new FallbackProductService();