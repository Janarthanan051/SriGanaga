const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dpajmriuqjrecpnfusyp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWptcml1cWpyZWNwbmZ1c3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTg4NDgsImV4cCI6MjA5NTg3NDg0OH0.OHSi6G9UxRFnE7_hKotnY3klklEfZGxR0V8A6EHInpI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  try {
    console.log('1. Fetching employees...');
    const { data: employees, error: empError } = await supabase.from('employees').select('*');
    if (empError) throw empError;
    console.log('Employees found:', employees.length);
    if (employees.length === 0) {
      console.log('No employees found to generate payroll for.');
      return;
    }

    const emp = employees[0];
    console.log('2. Calling calculate_payroll RPC for employee:', emp.first_name, emp.id);
    const { data: netSalary, error: rpcError } = await supabase.rpc('calculate_payroll', {
      emp_id: emp.id,
      month_num: 7,
      year_num: 2026
    });
    if (rpcError) {
      console.error('RPC Error:', rpcError);
    } else {
      console.log('RPC result (netSalary):', netSalary);
    }

    console.log('3. Testing upsert on payroll...');
    const payrollData = [{
      employee_id: emp.id,
      month: '2026-07',
      year: 2026,
      days_present: 20,
      basic_salary: emp.salary,
      net_salary: netSalary || 0,
      payment_status: 'pending'
    }];
    const { data, error } = await supabase
      .from('payroll')
      .upsert(payrollData, { onConflict: 'employee_id,month,year' })
      .select();
    if (error) {
      console.error('Upsert Error:', error);
    } else {
      console.log('Upsert success, result:', data);
    }
  } catch (err) {
    console.error('Fatal Error:', err);
  }
})();
