import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, StockInward, StockOutward } from '@/types';

interface InventoryState {
  products: Product[];
  stockInward: StockInward[];
  stockOutward: StockOutward[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  products: [],
  stockInward: [],
  stockOutward: [],
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    setStockInward: (state, action: PayloadAction<StockInward[]>) => {
      state.stockInward = action.payload;
    },
    setStockOutward: (state, action: PayloadAction<StockOutward[]>) => {
      state.stockOutward = action.payload;
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
  setProducts,
  addProduct,
  updateProduct,
  setStockInward,
  setStockOutward,
  setLoading,
  setError,
} = inventorySlice.actions;
export default inventorySlice.reducer;
