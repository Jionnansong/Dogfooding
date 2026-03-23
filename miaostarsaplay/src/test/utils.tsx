import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import authReducer from '@/store/slices/authSlice';
import { apiSlice } from '@/store/slices/apiSlice';
import type { RootState } from '@/store';

export const createMockStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    preloadedState: preloadedState as RootState,
  });
};

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    ...renderOptions
  }: {
    preloadedState?: Partial<RootState>;
    store?: ReturnType<typeof createMockStore>;
  } = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export const createLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    name: `Day ${i + 1}`,
    views: Math.floor(Math.random() * 100000),
    likes: Math.floor(Math.random() * 10000),
    retention: Math.floor(Math.random() * 100),
  }));
};

export const mockApiResponse = (data: any) => {
  return {
    data,
    isLoading: false,
    isFetching: false,
    isSuccess: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
};
