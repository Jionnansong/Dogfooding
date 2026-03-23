import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ResizeObserver for Recharts
class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {
    // Simulate resize event
    this.callback([{ contentRect: { width: 800, height: 400 } }] as ResizeObserverEntry[], this);
  }
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
  callback: IntersectionObserverCallback;
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: readonly number[] = [];
  
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;
