import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee, Attendance, Payroll } from '@/types';

interface HRState {
  employees: Employee[];
  attendance: Attendance[];
  payroll: Payroll[];
  loading: boolean;
  error: string | null;
}

const initialState: HRState = {
  employees: [],
  attendance: [],
  payroll: [],
  loading: false,
  error: null,
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.employees = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    setAttendance: (state, action: PayloadAction<Attendance[]>) => {
      state.attendance = action.payload;
    },
    addAttendanceRecord: (state, action: PayloadAction<Attendance>) => {
      state.attendance.push(action.payload);
    },
    setPayroll: (state, action: PayloadAction<Payroll[]>) => {
      state.payroll = action.payload;
    },
    addPayroll: (state, action: PayloadAction<Payroll>) => {
      state.payroll.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setEmployees,
  addEmployee,
  updateEmployee,
  setAttendance,
  addAttendanceRecord,
  setPayroll,
  addPayroll,
  setLoading,
  setError,
} = hrSlice.actions;
export default hrSlice.reducer;
