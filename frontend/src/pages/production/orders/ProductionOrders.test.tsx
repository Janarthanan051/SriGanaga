import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import ProductionOrders from './ProductionOrders';

// Mock dependencies
vi.mock('@ant-design/icons', () => ({
  PlusOutlined: () => <span data-testid="plus-icon">Plus</span>,
  SearchOutlined: () => <span data-testid="search-icon">Search</span>,
}));

// Mock window.matchMedia for antd
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ProductionOrders UI Component', () => {
  it('should render the Production Orders page correctly', () => {
    render(<ProductionOrders />);
    
    // Title should be present
    expect(screen.getByText('Production Orders')).toBeInTheDocument();
    
    // New Order button should be present
    expect(screen.getByText('New Order')).toBeInTheDocument();
    
    // Search input should be present
    expect(screen.getByPlaceholderText('Search production orders...')).toBeInTheDocument();
  });
  
  it('should render an empty state table if no data', () => {
    render(<ProductionOrders />);
    expect(screen.getByText('No production orders found')).toBeInTheDocument();
  });
});
