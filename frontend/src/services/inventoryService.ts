import { supabase } from '@config/supabase';
import { Product, StockInward, StockOutward } from '@/types';

export const productService = {
  // Get all products
  async getProducts(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('products').select('*', { count: 'exact' });

    if (filters) {
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as Product[], total: count || 0 };
  },

  // Get single product
  async getProduct(id: string) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Product;
  },

  // Create product
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) throw error;
    return data as Product;
  },

  // Update product
  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Product;
  },

  // Delete product
  async deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // Get low stock products
  async getLowStockProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('current_stock', 'reorder_level');
    if (error) throw error;
    return data as Product[];
  },
};

export const stockService = {
  // Get stock inward
  async getStockInward(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('stock_inward').select('*', { count: 'exact' });

    if (filters) {
      if (filters.product_id) query = query.eq('product_id', filters.product_id);
      if (filters.supplier_id) query = query.eq('supplier_id', filters.supplier_id);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('received_date', { ascending: false });

    if (error) throw error;
    return { data: data as StockInward[], total: count || 0 };
  },

  // Create stock inward
  async createStockInward(inward: Omit<StockInward, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('stock_inward').insert([inward]).select().single();
    if (error) throw error;
    return data as StockInward;
  },

  // Get stock outward
  async getStockOutward(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('stock_outward').select('*', { count: 'exact' });

    if (filters) {
      if (filters.product_id) query = query.eq('product_id', filters.product_id);
      if (filters.order_id) query = query.eq('order_id', filters.order_id);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('outward_date', { ascending: false });

    if (error) throw error;
    return { data: data as StockOutward[], total: count || 0 };
  },

  // Create stock outward
  async createStockOutward(outward: Omit<StockOutward, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('stock_outward').insert([outward]).select().single();
    if (error) throw error;
    return data as StockOutward;
  },

  // Get current stock
  async getCurrentStock(productId: string) {
    const { data: inward, error: inwardError } = await supabase
      .from('stock_inward')
      .select('quantity')
      .eq('product_id', productId);

    const { data: outward, error: outwardError } = await supabase
      .from('stock_outward')
      .select('quantity')
      .eq('product_id', productId);

    const { data: wastage, error: wastageError } = await supabase
      .from('wastage')
      .select('quantity')
      .eq('product_id', productId);

    if (inwardError || outwardError || wastageError) {
      throw inwardError || outwardError || wastageError;
    }

    const totalInward = inward?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalOutward = outward?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalWastage = wastage?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return totalInward - totalOutward - totalWastage;
  },
};
