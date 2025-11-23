// Smart service that uses Firebase when available, falls back to localStorage
import { firebaseProductService } from './firebase-products';
import { fallbackProductService } from './fallback-products';
import type { Product } from './products';

class SmartProductService {
  private useFirebase = true;
  private firebaseAvailable = false;
  
  async initialize(): Promise<void> {
    try {
      // Test Firebase connectivity
      this.firebaseAvailable = await firebaseProductService.isAvailable();
      console.log('🔥 Smart Service: Firebase available:', this.firebaseAvailable);
    } catch (error) {
      console.log('🔥 Smart Service: Firebase not available, using localStorage fallback');
      this.firebaseAvailable = false;
    }
  }

  private getService() {
    return this.firebaseAvailable ? firebaseProductService : fallbackProductService;
  }

  // Product management methods
  async getProducts(): Promise<Product[]> {
    const service = this.getService();
    if (service === firebaseProductService) {
      return await firebaseProductService.getProducts();
    } else {
      const result = await fallbackProductService.getProducts({ includeInactive: true });
      return result.products;
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    const service = this.getService();
    return await service.getProduct(id);
  }

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const service = this.getService();
    if (service === firebaseProductService) {
      return await firebaseProductService.createProduct(productData);
    } else {
      return await fallbackProductService.createProduct(productData);
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const service = this.getService();
    if (service === firebaseProductService) {
      await firebaseProductService.updateProduct(id, updates);
    } else {
      await fallbackProductService.updateProduct(id, updates);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const service = this.getService();
    await service.deleteProduct(id);
  }

  // Real-time subscription (only works with Firebase)
  subscribeToProducts(callback: (products: Product[]) => void): () => void {
    if (this.firebaseAvailable) {
      return firebaseProductService.subscribeToProducts(callback);
    } else {
      // For localStorage, we'll simulate real-time by checking periodically
      console.log('🔥 Smart Service: Using localStorage - no real-time updates available');
      
      // Initial load
      this.getProducts().then(callback);
      
      // Return empty unsubscribe function
      return () => {};
    }
  }

  // Status methods
  isFirebaseEnabled(): boolean {
    return this.firebaseAvailable;
  }

  getServiceType(): 'firebase' | 'localStorage' {
    return this.firebaseAvailable ? 'firebase' : 'localStorage';
  }
}

// Create singleton instance
export const smartProductService = new SmartProductService();

// Auto-initialize
smartProductService.initialize();

export default smartProductService;