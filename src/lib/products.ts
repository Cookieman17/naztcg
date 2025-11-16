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

// Get products from localStorage (admin products that are trading cards and active)
export function getProducts(): Product[] {
  try {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    return adminProducts
      .filter((product: any) => 
        product.category === 'Trading Cards' && 
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
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

export const products = getProducts();

export function getProductById(id: string): Product | null {
  const products = getProducts();
  return products.find((p) => p.id === id) ?? null;
}

// Real-time product updates
export function refreshProducts() {
  window.dispatchEvent(new CustomEvent('productsUpdated'));
}
