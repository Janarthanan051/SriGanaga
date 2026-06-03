import { supabase } from '@config/supabase';
import { Order, OrderItem, Vendor, Supplier } from '@/types';

export const vendorService = {
  // Get all vendors
  async getVendors(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('vendors').select('*', { count: 'exact' });

    if (filters) {
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as Vendor[], total: count || 0 };
  },

  // Get single vendor
  async getVendor(id: string) {
    const { data, error } = await supabase.from('vendors').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Vendor;
  },

  // Create vendor
  async createVendor(vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('vendors').insert([vendor]).select().single();
    if (error) throw error;
    return data as Vendor;
  },

  // Update vendor
  async updateVendor(id: string, updates: Partial<Vendor>) {
    const { data, error } = await supabase.from('vendors').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Vendor;
  },

  // Delete vendor
  async deleteVendor(id: string) {
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) throw error;
  },
};

export const orderService = {
  // Get orders
  async getOrders(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('orders').select('*', { count: 'exact' });

    if (filters) {
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.vendor_id) query = query.eq('vendor_id', filters.vendor_id);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('order_date', { ascending: false });

    if (error) throw error;
    return { data: data as Order[], total: count || 0 };
  },

  // Get single order with items
  async getOrder(id: string) {
    const { data: order, error: orderError } = await supabase.from('orders').select('*').eq('id', id).single();

    if (orderError) throw orderError;

    const { data: items, error: itemsError } = await supabase.from('order_items').select('*').eq('order_id', id);

    if (itemsError) throw itemsError;

    return { ...order, items: items as OrderItem[] };
  },

  // Create order
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id'>[]) {
    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsWithOrderId = items.map((item) => ({
      ...item,
      order_id: createdOrder.id,
    }));

    const { data: createdItems, error: itemsError } = await supabase.from('order_items').insert(itemsWithOrderId).select();

    if (itemsError) throw itemsError;

    return { ...createdOrder, items: createdItems };
  },

  // Update order status
  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data as Order;
  },

  // Delete order
  async deleteOrder(id: string) {
    // Delete items first
    await supabase.from('order_items').delete().eq('order_id', id);
    // Then delete order
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  },
};

export const supplierService = {
  // Get all suppliers
  async getSuppliers(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('suppliers').select('*', { count: 'exact' });

    if (filters) {
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as Supplier[], total: count || 0 };
  },

  // Get single supplier
  async getSupplier(id: string) {
    const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Supplier;
  },

  // Create supplier
  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('suppliers').insert([supplier]).select().single();
    if (error) throw error;
    return data as Supplier;
  },

  // Update supplier
  async updateSupplier(id: string, updates: Partial<Supplier>) {
    const { data, error } = await supabase.from('suppliers').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Supplier;
  },

  // Delete supplier
  async deleteSupplier(id: string) {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  },
};
