import { supabase } from '@config/supabase';

export interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  sales_rep_id?: string;
  status: string;
  total_amount: number;
  order_date: string;
  delivery_date?: string;
  notes?: string;
  created_at: string;
  items?: SalesOrderItem[];
}

export interface SalesOrderItem {
  id: string;
  sales_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products?: {
    name: string;
  };
}

export const salesService = {
  // Get sales orders for a specific customer
  async getSalesOrdersByCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('sales_orders')
      .select(`
        *,
        items:sales_order_items (
          *,
          products (
            name
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data as SalesOrder[];
  }
};
