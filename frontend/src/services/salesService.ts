import { supabase } from '@config/supabase';
import dayjs from 'dayjs';

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
  },

  // Get Analytics for Dispatched Revenue (Shipped or Delivered)
  async getSalesAnalytics() {
    const today = dayjs().format('YYYY-MM-DD');
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('sales_orders')
      .select('total_amount, order_date, status')
      .in('status', ['shipped', 'delivered'])
      .gte('order_date', startOfMonth)
      .lte('order_date', endOfMonth);

    if (error) throw error;

    let monthlyRevenue = 0;
    let todayRevenue = 0;
    
    // Create a 7-day trend map
    const trendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      trendMap[d] = 0;
    }

    data?.forEach(order => {
      const amt = Number(order.total_amount) || 0;
      monthlyRevenue += amt;
      
      if (order.order_date === today) {
        todayRevenue += amt;
      }
      
      if (trendMap[order.order_date] !== undefined) {
        trendMap[order.order_date] += amt;
      }
    });

    const revenueTrend = Object.keys(trendMap).map(date => ({
      name: dayjs(date).format('DD MMM'),
      revenue: trendMap[date]
    }));

    return {
      monthlyRevenue,
      todayRevenue,
      revenueTrend
    };
  }
};
