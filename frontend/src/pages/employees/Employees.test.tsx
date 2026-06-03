import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Employees from './Employees';
import authReducer from '@redux/authSlice';
import { vi } from 'vitest';

vi.mock('@services/hrService', () => ({
  employeeService: { getEmployees: vi.fn().mockResolvedValue({ data: [] }) },
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

describe('Employees Component', () => {
  it('renders without crashing', async () => {
    const initialState = {
      auth: {
        user: { user_metadata: { role: 'admin' } },
        session: null,
        loading: false,
      },
    };

    renderWithRedux(<Employees />, { initialState });
    await waitFor(() => {
      expect(screen.getByText(/Employee Management/i)).toBeInTheDocument();
    });
  });
});
