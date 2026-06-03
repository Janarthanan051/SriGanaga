import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProductionDashboard from './ProductionDashboard';
import authReducer from '@redux/authSlice';

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

describe('ProductionDashboard Component', () => {
  it('renders the Production Dashboard correctly', () => {
    const initialState = {
      auth: {
        user: { user_metadata: { role: 'warehouse_manager' } },
        session: null,
        loading: false,
      },
    };

    renderWithRedux(<ProductionDashboard />, { initialState });

    expect(screen.getByText('Production Control')).toBeInTheDocument();
    expect(screen.getByText('Active Work Orders')).toBeInTheDocument();
  });
});
