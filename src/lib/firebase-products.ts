// Firebase Firestore service for products
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './products';

const PRODUCTS_COLLECTION = 'products';

class FirebaseProductService {
  private listeners: (() => void)[] = [];

  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      console.log('🔥 Firebase: Getting products from Firestore...');
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      console.log('🔥 Firebase: Retrieved products:', products.length);
      return products;
    } catch (error) {
      console.error('🔥 Firebase: Error getting products:', error);
      throw error;
    }
  }

  // Get single product by ID
  async getProduct(id: string): Promise<Product | null> {
    try {
      console.log('🔥 Firebase: Getting product:', id);
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const product = { id: docSnap.id, ...docSnap.data() } as Product;
        console.log('🔥 Firebase: Retrieved product:', product.name);
        return product;
      } else {
        console.log('🔥 Firebase: Product not found:', id);
        return null;
      }
    } catch (error) {
      console.error('🔥 Firebase: Error getting product:', error);
      throw error;
    }
  }

  // Create new product
  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      console.log('🔥 Firebase: Creating product:', productData.name);
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const docData = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(productsRef, docData);
      
      const newProduct: Product = {
        id: docRef.id,
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('🔥 Firebase: Product created successfully:', newProduct.id);
      this.notifyListeners();
      return newProduct;
    } catch (error) {
      console.error('🔥 Firebase: Error creating product:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      console.log('🔥 Firebase: Updating product:', id);
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      console.log('🔥 Firebase: Product updated successfully');
      this.notifyListeners();
    } catch (error) {
      console.error('🔥 Firebase: Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      console.log('🔥 Firebase: Deleting product:', id);
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(docRef);
      console.log('🔥 Firebase: Product deleted successfully');
      this.notifyListeners();
    } catch (error) {
      console.error('🔥 Firebase: Error deleting product:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      console.log('🔥 Firebase: Searching products for:', searchTerm);
      const products = await this.getProducts();
      
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log('🔥 Firebase: Search results:', filteredProducts.length);
      return filteredProducts;
    } catch (error) {
      console.error('🔥 Firebase: Error searching products:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      console.log('🔥 Firebase: Getting products by category:', category);
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(
        productsRef, 
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      console.log('🔥 Firebase: Category products:', products.length);
      return products;
    } catch (error) {
      console.error('🔥 Firebase: Error getting products by category:', error);
      throw error;
    }
  }

  // Listen to real-time updates
  subscribeToProducts(callback: (products: Product[]) => void): () => void {
    console.log('🔥 Firebase: Setting up real-time listener');
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      console.log('🔥 Firebase: Real-time update - products:', products.length);
      callback(products);
    }, (error) => {
      console.error('🔥 Firebase: Real-time listener error:', error);
    });

    return unsubscribe;
  }

  // Add listener for manual notifications
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
        console.error('🔥 Firebase: Error in listener callback:', error);
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
      console.error('🔥 Firebase: Availability check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const firebaseProductService = new FirebaseProductService();

// Export for direct use
export default firebaseProductService;