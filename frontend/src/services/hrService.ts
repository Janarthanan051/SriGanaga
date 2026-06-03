import { supabase } from '@config/supabase';
import { Employee } from '@/types';
import dayjs from 'dayjs';

export const employeeService = {
  // Get all employees with pagination
  async getEmployees(page = 1, limit = 10, filters?: Record<string, any>) {
    let query = supabase.from('employees').select('*', { count: 'exact' });

    if (filters) {
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.department) query = query.eq('department', filters.department);
      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }
    }

    const from = (page - 1) * limit;
    const { data, count, error } = await query.range(from, from + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as Employee[], total: count || 0 };
  },

  // Get single employee
  async getEmployee(id: string) {
    const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Employee;
  },

  // Create new employee
  async createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  },

  // Update employee
  async updateEmployee(id: string, updates: Partial<Employee>) {
    const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Employee;
  },

  // Delete employee
  async deleteEmployee(id: string) {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  },

  // Generate employee ID
  async generateEmployeeId() {
    const { data, error } = await supabase
      .from('employees')
      .select('employee_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const lastId = data?.employee_id || 'EMP-0000';
    const number = parseInt(lastId.split('-')[1]) + 1;
    return `EMP-${String(number).padStart(4, '0')}`;
  },
};

export const attendanceService = {
  // Get attendance records
  async getAttendance(filters?: Record<string, any>) {
    let query = supabase.from('attendance').select('*');

    if (filters) {
      if (filters.employee_id) query = query.eq('employee_id', filters.employee_id);
      if (filters.month) {
        const startDate = `${filters.month}-01`;
        const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
        query = query.gte('date', startDate).lte('date', endDate);
      }
      if (filters.status) query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Record attendance
  async recordAttendance(attendance: Record<string, any>) {
    const { data, error } = await supabase.from('attendance').insert([attendance]).select().single();
    if (error) throw error;
    return data;
  },

  // Update attendance
  async updateAttendance(id: string, updates: Record<string, any>) {
    const { data, error } = await supabase.from('attendance').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // Get attendance report
  async getAttendanceReport(employeeId: string, month: string) {
    const startDate = `${month}-01`;
    const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const stats = {
      present: data?.filter((d) => d.status === 'present').length || 0,
      absent: data?.filter((d) => d.status === 'absent').length || 0,
      half_day: data?.filter((d) => d.status === 'half_day').length || 0,
      leave: data?.filter((d) => d.status === 'leave').length || 0,
    };

    return { data, stats };
  },
};

export const payrollService = {
  // Get payroll records
  async getPayroll(filters?: Record<string, any>) {
    let query = supabase.from('payroll').select('*');

    if (filters) {
      if (filters.employee_id) query = query.eq('employee_id', filters.employee_id);
      if (filters.month) query = query.eq('month', filters.month);
      if (filters.status) query = query.eq('payment_status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Generate payroll
  async generatePayroll(month: string, year: number) {
    const { data: employees, error: empError } = await supabase.from('employees').select('*');
    if (empError) throw empError;

    const payrollData = [];

    for (const emp of employees || []) {
      // Call database calculation function for precision (handles half-days, etc.)
      const monthNum = parseInt(month, 10);
      const { data: netSalary, error: rpcError } = await supabase.rpc('calculate_payroll', {
        emp_id: emp.id,
        month_num: monthNum,
        year_num: year,
      });

      if (rpcError) throw rpcError;

      // Count attendance present and half-days for reporting
      const formattedMonth = String(month).padStart(2, '0');
      const startDate = `${year}-${formattedMonth}-01`;
      const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');

      const { data: attendance, error: attError } = await supabase
        .from('attendance')
        .select('status')
        .eq('employee_id', emp.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (attError) throw attError;

      const daysPresent = attendance?.reduce((sum, item) => {
        if (item.status === 'present') return sum + 1.0;
        if (item.status === 'half_day') return sum + 0.5;
        return sum;
      }, 0) || 0;

      payrollData.push({
        employee_id: emp.id,
        month: `${year}-${String(month).padStart(2, '0')}`,
        year,
        days_present: Math.round(daysPresent),
        basic_salary: emp.salary,
        net_salary: netSalary || 0,
        payment_status: 'pending',
      });
    }

    const { data, error } = await supabase
      .from('payroll')
      .upsert(payrollData, { onConflict: 'employee_id,month,year' })
      .select();
    if (error) throw error;
    return data;
  },

  // Get single payroll
  async getPayrollRecord(id: string) {
    const { data, error } = await supabase.from('payroll').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  // Update payroll status
  async updatePayrollStatus(id: string, status: string) {
    const { data, error } = await supabase.from('payroll').update({ payment_status: status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};
