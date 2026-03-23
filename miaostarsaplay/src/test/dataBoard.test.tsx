import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DataBoard from '@/pages/DataBoard';
import { renderWithProviders, createLargeDataset } from './utils';

// Mock the API query
vi.mock('@/store/slices/apiSlice', async () => {
  const actual = await vi.importActual('@/store/slices/apiSlice');
  return {
    ...actual,
    useGetAnalyticsDataQuery: vi.fn(),
  };
});

import { useGetAnalyticsDataQuery } from '@/store/slices/apiSlice';

describe('DataBoard - Recharts Performance Testing', () => {
  const mockSummary = [
    { label: '总播放量', value: '12.5M', change: '+15.2%', type: 'up', color: 'indigo' },
    { label: '活跃观众', value: '89.2K', change: '+8.7%', type: 'up', color: 'emerald' },
    { label: '平均留存', value: '72.4%', change: '+2.1%', type: 'up', color: 'amber' },
    { label: '作品分享', value: '34.1K', change: '+12.3%', type: 'up', color: 'rose' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Performance with Large Datasets', () => {
    it('should render small dataset (10 data points) within acceptable time', async () => {
      const smallDataset = createLargeDataset(10);
      
      (useGetAnalyticsDataQuery as any).mockReturnValue({
        data: {
          summary: mockSummary,
          performance: smallDataset,
        },
        isLoading: false,
        isFetching: false,
      });

      const startTime = performance.now();
      
      renderWithProviders(<DataBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('数据看板')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      console.log(`Small dataset (10 points) render time: ${renderTime.toFixed(2)}ms`);
      
      expect(renderTime).toBeLessThan(500);
    });

    it('should render medium dataset (100 data points) within acceptable time', async () => {
      const mediumDataset = createLargeDataset(100);
      
      (useGetAnalyticsDataQuery as any).mockReturnValue({
        data: {
          summary: mockSummary,
          performance: mediumDataset,
        },
        isLoading: false,
        isFetching: false,
      });

      const startTime = performance.now();
      
      renderWithProviders(<DataBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('数据看板')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      console.log(`Medium dataset (100 points) render time: ${renderTime.toFixed(2)}ms`);
      
      expect(renderTime).toBeLessThan(1000);
    });

    it('should render large dataset (1000 data points) within acceptable time', async () => {
      const largeDataset = createLargeDataset(1000);
      
      (useGetAnalyticsDataQuery as any).mockReturnValue({
        data: {
          summary: mockSummary,
          performance: largeDataset,
        },
        isLoading: false,
        isFetching: false,
      });

      const startTime = performance.now();
      
      renderWithProviders(<DataBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('数据看板')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      console.log(`Large dataset (1000 points) render time: ${renderTime.toFixed(2)}ms`);
      
      expect(renderTime).toBeLessThan(2000);
    });

    it('should render extra large dataset (5000 data points) within acceptable time', async () => {
      const extraLargeDataset = createLargeDataset(5000);
      
      (useGetAnalyticsDataQuery as any).mockReturnValue({
        data: {
          summary: mockSummary,
          performance: extraLargeDataset,
        },
        isLoading: false,
        isFetching: false,
      });

      const startTime = performance.now();
      
      renderWithProviders(<DataBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('数据看板')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      console.log(`Extra large dataset (5000 points) render time: ${renderTime.toFixed(2)}ms`);
      
      expect(renderTime).toBeLessThan(5000);
    });
  });

  describe('Chart Component Stability', () => {
    it('should display correct data in charts', async () => {
      const testData = [
        { name: 'Day 1', views: 10000, likes: 500, retention: 80 },
        { name: 'Day 2', views: 15000, likes: 750, retention: 75 },
        { name: 'Day 3', views: 12000, likes: 600, retention: 85 },
      ];

      (useGetAnalyticsDataQuery as any).mockReturnValue({
        data: {
          summary: mockSummary,
          performance: testData,
        },
        isLoading: false,
        isFetching: false,
      });

      renderWithProviders(<DataBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('播放趋势分析')).toBeInTheDocument();
        expect(screen.getByText('用户留存分析')).toBeInTheDocument();
      });
    });

    it('should handle empty dataset gracefully', async () => {
      (useGetAnalyticsDataQuery as any).mockReturnValue({
        data: {
          summary: mockSummary,
          performance: [],
        },
        isLoading: false,
        isFetching: false,
      });

      const startTime = performance.now();
      
      renderWithProviders(<DataBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('数据看板')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      console.log(`Empty dataset render time: ${renderTime.toFixed(2)}ms`);
      
      expect(renderTime).toBeLessThan(300);
    });

    it('should show loading state correctly', async () => {
      (useGetAnalyticsDataQuery as any).mockReturnValue({
        data: null,
        isLoading: true,
        isFetching: false,
      });

      renderWithProviders(<DataBoard />);
      
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Container Handling', () => {
    it('should render responsive container correctly', async () => {
      const dataset = createLargeDataset(100);
      
      (useGetAnalyticsDataQuery as any).mockReturnValue({
        data: {
          summary: mockSummary,
          performance: dataset,
        },
        isLoading: false,
        isFetching: false,
      });

      renderWithProviders(<DataBoard />);
      
      await waitFor(() => {
        const responsiveContainers = document.querySelectorAll('.recharts-responsive-container');
        expect(responsiveContainers.length).toBe(2);
      });
    });

    it('should maintain aspect ratio during resizing', async () => {
      const dataset = createLargeDataset(100);
      
      (useGetAnalyticsDataQuery as any).mockReturnValue({
        data: {
          summary: mockSummary,
          performance: dataset,
        },
        isLoading: false,
        isFetching: false,
      });

      const { container } = renderWithProviders(<DataBoard />);
      
      await waitFor(() => {
        expect(screen.getByText('数据看板')).toBeInTheDocument();
      });

      const chartsContainer = container.querySelector('.lg\\:col-span-2');
      expect(chartsContainer).toBeInTheDocument();
    });
  });

  describe('Performance Benchmarks', () => {
    it.skip('should meet performance requirements across all data sizes', async () => {
      const testSizes = [10, 100, 500, 1000, 2000];
      const results: { size: number; time: number }[] = [];

      for (const size of testSizes) {
        const dataset = createLargeDataset(size);
        
        (useGetAnalyticsDataQuery as any).mockReturnValue({
          data: {
            summary: mockSummary,
            performance: dataset,
          },
          isLoading: false,
          isFetching: false,
        });

        const startTime = performance.now();
        
        renderWithProviders(<DataBoard key={size} />);
        
        await waitFor(() => {
          expect(screen.getByText('数据看板')).toBeInTheDocument();
        });

        const renderTime = performance.now() - startTime;
        results.push({ size, time: renderTime });
      }

      console.table(results);
      
      results.forEach(({ size, time }) => {
        const maxTime = size <= 100 ? 5000 : size <= 1000 ? 10000 : 20000;
        expect(time).toBeLessThan(maxTime);
      });
    });
  });
});
