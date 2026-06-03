import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from './Dashboard';
import authReducer from '@redux/authSlice'; // assuming authSlice is the default export
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Recharts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock the services
vi.mock('@services/inventoryService', () => ({
  productService: { getProducts: vi.fn().mockResolvedValue({ data: [] }) },
}));
vi.mock('@services/hrService', () => ({
  employeeService: { getEmployees: vi.fn().mockResolvedValue({ data: [] }) },
  attendanceService: { getAttendance: vi.fn().mockResolvedValue([]) },
  payrollService: { getPayroll: vi.fn().mockResolvedValue([]) },
}));
vi.mock('@services/vendorService', () => ({
  orderService: { getOrders: vi.fn().mockResolvedValue({ data: [] }) },
  vendorService: { getVendors: vi.fn().mockResolvedValue({ data: [] }) },
}));
vi.mock('@services/operationsService', () => ({
  expenseService: { 
    getMonthlyExpenses: vi.fn().mockResolvedValue({ total: 0, data: [] }),
    getExpensesTrend: vi.fn().mockResolvedValue([])
  },
  wastageService: { getWastage: vi.fn().mockResolvedValue({ data: [], total: 0 }) },
}));

const renderWithRedux = (
  component: React.ReactElement,
  {
    initialState,
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: initialState,
    }),
  }: any = {}
) => {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe('Dashboard Component', () => {
  it('renders the Dashboard without crashing', async () => {
    const initialState = {
      auth: {
        user: { user_metadata: { role: 'admin' } },
        session: null,
        loading: false,
      },
    };

    renderWithRedux(<Dashboard />, { initialState });

    // Wait for the Dashboard title to be displayed
    await waitFor(() => {
      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });
  });
});
