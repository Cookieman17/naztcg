import { cloudStorage } from './cloudStorage';

export type Product = {
  id: string;
  name: string;
  set: string;
  grade: number | null;
  price: number;
  image: string;
  serialNumber: string | null;
  description?: string;
  series: string;
  rarity: string;
  category: string;
  stock: number;
  status: 'active' | 'inactive';
};

// Get products from Supabase cloud database (for shop display)
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('🛍️ Loading products for shop from Supabase...');
    
    // Load from cloud database instead of localStorage
    const adminProducts = await cloudStorage.loadProducts();
    
    const shopProducts = adminProducts
      .filter((product: any) => 
        product.status === 'active' &&
        product.stock > 0
      )
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        set: product.series || 'Unknown Set',
        grade: null, // Will be set when graded
        price: product.price,
        image: product.image || '/placeholder.svg',
        serialNumber: null, // Generated when graded
        description: product.description,
        series: product.series,
        rarity: product.rarity,
        category: product.category,
        stock: product.stock,
        status: product.status
      }));
    
    console.log(`✅ Loaded ${shopProducts.length} products for shop from cloud`);
    return shopProducts;
  } catch (error) {
    console.error('❌ Error loading products for shop:', error);
    return [];
  }
}

// Synchronous version for backwards compatibility (loads from localStorage as fallback)
export function getProductsSync(): Product[] {
  try {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    return adminProducts
      .filter((product: any) => 
        product.status === 'active' &&
        product.stock > 0
      )
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        set: product.series || 'Unknown Set',
        grade: null,
        price: product.price,
        image: product.image || '/placeholder.svg',
        serialNumber: null,
        description: product.description,
        series: product.series,
        rarity: product.rarity,
        category: product.category,
        stock: product.stock,
        status: product.status
      }));
  } catch (error) {
    console.error('Error loading products from localStorage:', error);
    return [];
  }
}

// For async loading
export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) ?? null;
}

// For sync loading (fallback)
export function getProductByIdSync(id: string): Product | null {
  const products = getProductsSync();
  return products.find((p) => p.id === id) ?? null;
}

// Real-time product updates
export function refreshProducts() {
  window.dispatchEvent(new CustomEvent('productsUpdated'));
}
