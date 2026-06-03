import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Inventory from './Inventory';
import authReducer from '@redux/authSlice';
import { vi } from 'vitest';

vi.mock('@services/inventoryService', () => ({
  productService: { getProducts: vi.fn().mockResolvedValue({ data: [] }) },
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

describe('Inventory Component', () => {
  it('renders without crashing', () => {
    const initialState = {
      auth: {
        user: { user_metadata: { role: 'admin' } },
        session: null,
        loading: false,
      },
    };

    renderWithRedux(<Inventory />, { initialState });
    expect(screen.getByText(/Inventory/i)).toBeInTheDocument();
  });
});
