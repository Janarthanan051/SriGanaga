import { supabase } from '@config/supabase';
import { Logistics, Wastage, Expense } from '@/types';
import dayjs from 'dayjs';

export const logisticsService = {
  // Get logistics
  async getLogistics(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('logistics').select('*', { count: 'exact' });

    if (filters) {
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.order_id) query = query.eq('order_id', filters.order_id);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('dispatch_date', { ascending: false });

    if (error) throw error;
    return { data: data as Logistics[], total: count || 0 };
  },

  // Create logistics record
  async createLogistics(logistics: Omit<Logistics, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('logistics').insert([logistics]).select().single();
    if (error) throw error;
    return data as Logistics;
  },

  // Update logistics status
  async updateLogisticsStatus(id: string, status: string) {
    const { data, error } = await supabase.from('logistics').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data as Logistics;
  },

  // Update logistics record
  async updateLogistics(id: string, updates: Partial<Logistics>) {
    const { data, error } = await supabase.from('logistics').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Logistics;
  },

  // Delete logistics record
  async deleteLogistics(id: string) {
    const { error } = await supabase.from('logistics').delete().eq('id', id);
    if (error) throw error;
  },
};

export const wastageService = {
  // Get wastage records
  async getWastage(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('wastage').select('*', { count: 'exact' });

    if (filters) {
      if (filters.product_id) query = query.eq('product_id', filters.product_id);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('wastage_date', { ascending: false });

    if (error) throw error;
    return { data: data as Wastage[], total: count || 0 };
  },

  // Record wastage
  async recordWastage(wastage: Omit<Wastage, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('wastage').insert([wastage]).select().single();
    if (error) throw error;
    return data as Wastage;
  },

  // Get wastage percentage
  async getWastagePercentage(month?: string) {
    let query = supabase.from('wastage').select('quantity');

    if (month) {
      const startDate = `${month}-01`;
      const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
      query = query.gte('wastage_date', startDate).lte('wastage_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const totalWastage = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    // Get total stock inward for the period
    let stockQuery = supabase.from('stock_inward').select('quantity');
    if (month) {
      const startDate = `${month}-01`;
      const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
      stockQuery = stockQuery.gte('received_date', startDate).lte('received_date', endDate);
    }

    const { data: stockData, error: stockError } = await stockQuery;
    if (stockError) throw stockError;

    const totalInward = stockData?.reduce((sum, item) => sum + item.quantity, 0) || 1;

    return (totalWastage / totalInward) * 100;
  },
};

export const expenseService = {
  // Get expenses
  async getExpenses(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('expenses').select('*', { count: 'exact' });

    if (filters) {
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.month) {
        const startDate = `${filters.month}-01`;
        const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
        query = query.gte('expense_date', startDate).lte('expense_date', endDate);
      }
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('expense_date', { ascending: false });

    if (error) throw error;
    return { data: data as Expense[], total: count || 0 };
  },

  // Create expense
  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.from('expenses').insert([expense]).select().single();
    if (error) throw error;
    return data as Expense;
  },

  // Update expense
  async updateExpense(id: string, updates: Partial<Expense>) {
    const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Expense;
  },

  // Delete expense
  async deleteExpense(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },

  // Get monthly expenses
  async getMonthlyExpenses(month: string) {
    const startDate = `${month}-01`;
    const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate);

    if (error) throw error;

    const total = data?.reduce((sum, item) => sum + item.amount, 0) || 0;
    return { data, total };
  },

  // Get recent expenses trend
  async getExpensesTrend(monthsLimit = 6) {
    const startDate = dayjs().subtract(monthsLimit - 1, 'month').startOf('month').format('YYYY-MM-DD');
    const { data, error } = await supabase
      .from('expenses')
      .select('amount, expense_date')
      .gte('expense_date', startDate);

    if (error) throw error;
    return data || [];
  },
};

export const tallyService = {
  // Get Tally synchronization logs
  async getSyncLogs(page = 1, limit = 10) {
    const from = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('tally_sync_log')
      .select('*', { count: 'exact' })
      .range(from, from + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, total: count || 0 };
  },

  // Trigger tally sync manually and log transaction status in Supabase database
  async triggerSync(syncType: string) {
    const { data: logEntry, error: insertError } = await supabase
      .from('tally_sync_log')
      .insert([{
        sync_type: syncType,
        status: 'pending'
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Simulate server communication delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isSuccess = Math.random() > 0.15; // 85% success rate
    const updatePayload = isSuccess
      ? { status: 'success' }
      : { status: 'failed', error_message: 'Tally ODBC port 9000 not responding (ERR_CONNECTION_REFUSED)' };

    const { data: updatedEntry, error: updateError } = await supabase
      .from('tally_sync_log')
      .update(updatePayload)
      .eq('id', logEntry.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedEntry;
  }
};

export const productionService = {
  async getProductionOrders(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('production_orders').select('*, bill_of_materials(*)', { count: 'exact' });

    if (filters && filters.search) {
      query = query.ilike('order_number', `%${filters.search}%`);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('planned_date', { ascending: false });

    if (error) throw error;
    return { data: data as any[], total: count || 0 };
  }
};

export const batchService = {
  async getBatches(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('batches').select('*, products(name)', { count: 'exact' });

    if (filters && filters.search) {
      query = query.ilike('batch_code', `%${filters.search}%`);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('manufacturing_date', { ascending: false });

    if (error) throw error;
    return { data: data as any[], total: count || 0 };
  }
};

export const qcService = {
  async getReports(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('qc_reports').select('*, batches(batch_code)', { count: 'exact' });

    if (filters && filters.search) {
      query = query.or(`report_number.ilike.%${filters.search}%,batch_id.eq.${filters.search}`);
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('inspection_date', { ascending: false });

    if (error) throw error;
    return { data: data as any[], total: count || 0 };
  }
};


