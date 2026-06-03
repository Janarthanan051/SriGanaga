import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Orders from './Orders';
import authReducer from '@redux/authSlice';
import { vi } from 'vitest';

vi.mock('@services/vendorService', () => ({
  orderService: { getOrders: vi.fn().mockResolvedValue({ data: [] }) },
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

describe('Orders Component', () => {
  it('renders without crashing', async () => {
    const initialState = {
      auth: {
        user: { user_metadata: { role: 'admin' } },
        session: null,
        loading: false,
      },
    };

    renderWithRedux(<Orders />, { initialState });
    
    // Wait for the text to appear
    await waitFor(() => {
      expect(screen.getByText(/Order Management/i)).toBeInTheDocument();
    });
  });
});
