// services/productService.ts - Complete product management with Supabase
import { supabase, Product, ProductVariant, InventoryLogEntry } from '@/lib/supabase';

export interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
}

export interface CreateProductData {
  name: string;
  description?: string;
  series: string;
  set_name?: string;
  rarity: string;
  category: string;
  base_price: number;
  image_url?: string;
  stock_quantity: number;
  status?: 'active' | 'inactive' | 'discontinued';
}

export interface CreateVariantData {
  product_id: string;
  grade?: number;
  serial_number?: string;
  condition?: string;
  price: number;
  stock_quantity: number;
  status?: 'available' | 'sold' | 'reserved';
}

export interface ProductFilters {
  category?: string;
  series?: string;
  rarity?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

class ProductService {
  // Get all products with optional filters
  async getProducts(filters?: ProductFilters): Promise<ProductWithVariants[]> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.series) {
        query = query.eq('series', filters.series);
      }
      if (filters?.rarity) {
        query = query.eq('rarity', filters.rarity);
      }
      if (filters?.minPrice) {
        query = query.gte('base_price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('base_price', filters.maxPrice);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  }

  // Get single product by ID with variants
  async getProductById(id: string): Promise<ProductWithVariants | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          variants:product_variants(*)
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Admin: Create new product
  async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          status: productData.status || 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      // Log inventory if stock > 0
      if (productData.stock_quantity > 0) {
        await this.logInventoryChange(data.id, null, 'restock', productData.stock_quantity, 0);
      }

      return data;
    } catch (error) {
      console.error('Product creation error:', error);
      throw error;
    }
  }

  // Admin: Update product
  async updateProduct(id: string, updates: Partial<CreateProductData>): Promise<Product> {
    try {
      // Get current product for inventory tracking
      const current = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      // Log inventory changes if stock changed
      if (current.data && updates.stock_quantity !== undefined && updates.stock_quantity !== current.data.stock_quantity) {
        const change = updates.stock_quantity - current.data.stock_quantity;
        const changeType = change > 0 ? 'restock' : 'adjustment';
        await this.logInventoryChange(id, null, changeType, change, current.data.stock_quantity);
      }

      return data;
    } catch (error) {
      console.error('Product update error:', error);
      throw error;
    }
  }

  // Admin: Delete product (soft delete by setting status)
  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'discontinued' })
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    } catch (error) {
      console.error('Product deletion error:', error);
      throw error;
    }
  }

  // Admin: Create product variant (for graded cards)
  async createProductVariant(variantData: CreateVariantData): Promise<ProductVariant> {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          ...variantData,
          status: variantData.status || 'available'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating variant:', error);
        throw error;
      }

      // Log inventory if stock > 0
      if (variantData.stock_quantity > 0) {
        await this.logInventoryChange(null, data.id, 'restock', variantData.stock_quantity, 0);
      }

      return data;
    } catch (error) {
      console.error('Variant creation error:', error);
      throw error;
    }
  }

  // Admin: Update product variant
  async updateProductVariant(id: string, updates: Partial<CreateVariantData>): Promise<ProductVariant> {
    try {
      // Get current variant for inventory tracking
      const current = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating variant:', error);
        throw error;
      }

      // Log inventory changes if stock changed
      if (current.data && updates.stock_quantity !== undefined && updates.stock_quantity !== current.data.stock_quantity) {
        const change = updates.stock_quantity - current.data.stock_quantity;
        const changeType = change > 0 ? 'restock' : 'adjustment';
        await this.logInventoryChange(null, id, changeType, change, current.data.stock_quantity);
      }

      return data;
    } catch (error) {
      console.error('Variant update error:', error);
      throw error;
    }
  }

  // Check product availability and stock
  async checkAvailability(productId?: string, variantId?: string, quantity: number = 1): Promise<boolean> {
    try {
      if (variantId) {
        const { data } = await supabase
          .from('product_variants')
          .select('stock_quantity, status')
          .eq('id', variantId)
          .eq('status', 'available')
          .single();

        return data ? data.stock_quantity >= quantity : false;
      }

      if (productId) {
        const { data } = await supabase
          .from('products')
          .select('stock_quantity, status')
          .eq('id', productId)
          .eq('status', 'active')
          .single();

        return data ? data.stock_quantity >= quantity : false;
      }

      return false;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  // Reserve stock for cart/order (reduces available quantity)
  async reserveStock(productId?: string, variantId?: string, quantity: number = 1, referenceId?: string): Promise<boolean> {
    try {
      if (variantId) {
        const { data: current } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variantId)
          .single();

        if (!current || current.stock_quantity < quantity) return false;

        const { error } = await supabase
          .from('product_variants')
          .update({ stock_quantity: current.stock_quantity - quantity })
          .eq('id', variantId);

        if (!error) {
          await this.logInventoryChange(null, variantId, 'reserve', -quantity, current.stock_quantity, referenceId);
        }

        return !error;
      }

      if (productId) {
        const { data: current } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', productId)
          .single();

        if (!current || current.stock_quantity < quantity) return false;

        const { error } = await supabase
          .from('products')
          .update({ stock_quantity: current.stock_quantity - quantity })
          .eq('id', productId);

        if (!error) {
          await this.logInventoryChange(productId, null, 'reserve', -quantity, current.stock_quantity, referenceId);
        }

        return !error;
      }

      return false;
    } catch (error) {
      console.error('Error reserving stock:', error);
      return false;
    }
  }

  // Release reserved stock (if cart abandoned, payment failed, etc.)
  async releaseStock(productId?: string, variantId?: string, quantity: number = 1, referenceId?: string): Promise<boolean> {
    try {
      if (variantId) {
        const { data: current } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', variantId)
          .single();

        if (!current) return false;

        const { error } = await supabase
          .from('product_variants')
          .update({ stock_quantity: current.stock_quantity + quantity })
          .eq('id', variantId);

        if (!error) {
          await this.logInventoryChange(null, variantId, 'release', quantity, current.stock_quantity, referenceId);
        }

        return !error;
      }

      if (productId) {
        const { data: current } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', productId)
          .single();

        if (!current) return false;

        const { error } = await supabase
          .from('products')
          .update({ stock_quantity: current.stock_quantity + quantity })
          .eq('id', productId);

        if (!error) {
          await this.logInventoryChange(productId, null, 'release', quantity, current.stock_quantity, referenceId);
        }

        return !error;
      }

      return false;
    } catch (error) {
      console.error('Error releasing stock:', error);
      return false;
    }
  }

  // Get product categories for filtering
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'active');

      if (error) throw error;

      const categories = [...new Set(data.map(p => p.category))].sort();
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get product series for filtering
  async getSeries(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('series')
        .eq('status', 'active');

      if (error) throw error;

      const series = [...new Set(data.map(p => p.series))].sort();
      return series;
    } catch (error) {
      console.error('Error fetching series:', error);
      return [];
    }
  }

  // Private: Log inventory changes
  private async logInventoryChange(
    productId: string | null,
    variantId: string | null,
    changeType: 'restock' | 'sale' | 'adjustment' | 'reserve' | 'release',
    quantityChange: number,
    previousQuantity: number,
    referenceId?: string,
    referenceType?: string,
    notes?: string,
    createdBy?: string
  ): Promise<void> {
    try {
      await supabase
        .from('inventory_log')
        .insert({
          product_id: productId,
          product_variant_id: variantId,
          change_type: changeType,
          quantity_change: quantityChange,
          previous_quantity: previousQuantity,
          new_quantity: previousQuantity + quantityChange,
          reference_id: referenceId,
          reference_type: referenceType,
          notes,
          created_by: createdBy
        });
    } catch (error) {
      console.error('Error logging inventory change:', error);
      // Don't throw error - logging shouldn't fail the main operation
    }
  }

  // Admin: Get inventory log
  async getInventoryLog(productId?: string, variantId?: string, limit: number = 50): Promise<InventoryLogEntry[]> {
    try {
      let query = supabase
        .from('inventory_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }
      if (variantId) {
        query = query.eq('product_variant_id', variantId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching inventory log:', error);
      return [];
    }
  }
}

// Export singleton instance
export const productService = new ProductService();