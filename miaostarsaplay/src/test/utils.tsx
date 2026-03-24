import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import authReducer from '@/store/slices/authSlice';
import { apiSlice } from '@/store/slices/apiSlice';
import { User, UserVersion, Project, TeamMember, Brand } from '@/types';

export interface TestUser extends User {
  tokenQuota: {
    used: number;
    total: number;
  };
}

export const createMockUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: '1',
  username: '测试用户',
  avatar: 'https://picsum.photos/200/200?random=1',
  version: UserVersion.PRO,
  tokenQuota: {
    used: 1250,
    total: 10000,
  },
  ...overrides,
});

export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'test-project-1',
  title: '测试项目',
  description: '这是一个测试项目',
  content: '测试内容',
  script_dialogue: '测试对白',
  script_action: '测试动作',
  script_camera: '测试镜头',
  characters: [],
  status: 'planning',
  updatedAt: '2023-10-25',
  author: '测试作者',
  ...overrides,
});

export const createMockTeamMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  id: 'm1',
  name: '测试成员',
  email: 'test@example.com',
  role: '编剧',
  status: 'Active',
  joinDate: '2023-08-12',
  avatar: 'https://picsum.photos/40/40?random=10',
  ...overrides,
});

export const createMockBrand = (overrides: Partial<Brand> = {}): Brand => ({
  id: 'b1',
  name: '测试品牌',
  slogan: '测试标语',
  logo: 'https://picsum.photos/100/100?random=20',
  primaryColor: '#6366f1',
  secondaryColor: '#818cf8',
  projectCount: 12,
  updatedAt: '2023-10-20',
  ...overrides,
});

export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    preloadedState,
  });
};

interface WrapperProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<WrapperProps> = ({ children }) => {
  const store = createTestStore();
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export const renderWithStore = (
  ui: ReactElement,
  preloadedState = {},
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const store = createTestStore(preloadedState);
  const Wrapper: React.FC<WrapperProps> = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    store,
  };
};

export * from '@testing-library/react';
export { customRender as render };
