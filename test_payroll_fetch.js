const supabaseUrl = 'https://dpajmriuqjrecpnfusyp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYWptcml1cWpyZWNwbmZ1c3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTg4NDgsImV4cCI6MjA5NTg3NDg0OH0.OHSi6G9UxRFnE7_hKotnY3klklEfZGxR0V8A6EHInpI';

const headers = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json'
};

(async () => {
  try {
    console.log('1. Fetching employees...');
    const resEmp = await fetch(`${supabaseUrl}/rest/v1/employees?select=*`, { headers });
    if (!resEmp.ok) throw new Error(`Fetch employees failed: ${await resEmp.text()}`);
    const employees = await resEmp.json();
    console.log('Employees found:', employees.length);
    if (employees.length === 0) return;

    const emp = employees[0];
    console.log(`2. Calling calculate_payroll for ${emp.first_name} (${emp.id})...`);
    const resRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/calculate_payroll`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        emp_id: emp.id,
        month_num: 7,
        year_num: 2026
      })
    });
    
    if (!resRpc.ok) {
      console.error('RPC Error:', await resRpc.text());
    } else {
      const netSalary = await resRpc.json();
      console.log('RPC result (netSalary):', netSalary);
    }

    console.log('3. Testing upsert on payroll...');
    const resUpsert = await fetch(`${supabaseUrl}/rest/v1/payroll`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify([{
        employee_id: emp.id,
        month: '2026-07',
        year: 2026,
        days_present: 20,
        basic_salary: emp.salary,
        net_salary: 15000.00,
        payment_status: 'pending'
      }])
    });

    if (!resUpsert.ok) {
      console.error('Upsert Error:', await resUpsert.text());
    } else {
      console.log('Upsert success!');
    }

  } catch (err) {
    console.error('Fatal Error:', err);
  }
})();
