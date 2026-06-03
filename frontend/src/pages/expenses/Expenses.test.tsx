import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Expenses from './Expenses';
import authReducer from '@redux/authSlice';
import { vi } from 'vitest';

vi.mock('@services/operationsService', () => ({
  expenseService: { getExpenses: vi.fn().mockResolvedValue({ data: [] }) },
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

describe('Expenses Component', () => {
  it('renders without crashing', async () => {
    const initialState = {
      auth: {
        user: { user_metadata: { role: 'admin' } },
        session: null,
        loading: false,
      },
    };

    renderWithRedux(<Expenses />, { initialState });
    await waitFor(() => {
      expect(screen.getByText(/Expense Management/i)).toBeInTheDocument();
    });
  });
});
