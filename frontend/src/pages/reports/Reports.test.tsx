import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Reports from './Reports';
import authReducer from '@redux/authSlice';
import { vi } from 'vitest';

// Mocking the matchMedia
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

describe('Reports Component', () => {
  it('renders without crashing', () => {
    const initialState = {
      auth: {
        user: { user_metadata: { role: 'admin' } },
        session: null,
        loading: false,
      },
    };

    renderWithRedux(<Reports />, { initialState });
    expect(screen.getByText(/Reports/i)).toBeInTheDocument();
  });
});
