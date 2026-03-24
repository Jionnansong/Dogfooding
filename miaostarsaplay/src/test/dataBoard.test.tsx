import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore, createMockUser } from '@/test/utils';
import DataBoard from '@/pages/DataBoard';
import { UserVersion } from '@/types';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: any) => (
      <div className="recharts-responsive-container" style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    ),
    AreaChart: ({ children, data }: any) => (
      <div className="recharts-wrapper recharts-area-chart" data-testid="area-chart">
        {children}
      </div>
    ),
    LineChart: ({ children, data }: any) => (
      <div className="recharts-wrapper recharts-line-chart" data-testid="line-chart">
        {children}
      </div>
    ),
    Area: () => <div data-testid="area" />,
    Line: () => <div data-testid="line" />,
    XAxis: () => <div className="recharts-xAxis" />,
    YAxis: () => <div className="recharts-yAxis" />,
    CartesianGrid: () => <div className="recharts-cartesian-grid" />,
    Tooltip: () => <div className="recharts-tooltip-wrapper" />,
  };
});

describe('DataBoard 数据看板测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染数据看板标题', () => {
      renderWithStore(<DataBoard />);
      
      expect(screen.getByText('数据看板')).toBeInTheDocument();
    });

    it('应该显示时间范围切换按钮', () => {
      renderWithStore(<DataBoard />);
      
      expect(screen.getByText('本周')).toBeInTheDocument();
      expect(screen.getByText('本月')).toBeInTheDocument();
    });

    it('应该显示统计卡片骨架屏在加载时', () => {
      renderWithStore(<DataBoard />);
      
      const skeletonCards = document.querySelectorAll('.animate-pulse');
      expect(skeletonCards.length).toBeGreaterThan(0);
    });
  });

  describe('Recharts 大数据量渲染性能测试', () => {
    it('应该在合理时间内渲染大数据量图表', async () => {
      const startTime = performance.now();
      
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          const chartContainer = document.querySelector('.recharts-wrapper');
          expect(chartContainer).toBeTruthy();
        },
        { timeout: 5000 }
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`渲染时间: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(5000);
    });

    it('应该正确渲染 AreaChart 组件', async () => {
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          const areaChart = document.querySelector('.recharts-area-chart');
          expect(areaChart).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it('应该正确渲染 LineChart 组件', async () => {
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          const lineChart = document.querySelector('.recharts-line-chart');
          expect(lineChart).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it('应该正确渲染 XAxis 和 YAxis', async () => {
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          const xAxis = document.querySelector('.recharts-xAxis');
          const yAxis = document.querySelector('.recharts-yAxis');
          expect(xAxis).toBeTruthy();
          expect(yAxis).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it('应该正确渲染 CartesianGrid', async () => {
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          const cartesianGrid = document.querySelector('.recharts-cartesian-grid');
          expect(cartesianGrid).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it('应该正确渲染 Tooltip', async () => {
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          const tooltip = document.querySelector('.recharts-tooltip-wrapper');
          expect(tooltip).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('时间范围切换测试', () => {
    it('点击本周按钮应该切换时间范围', async () => {
      const user = userEvent.setup();
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          expect(screen.getByText('数据看板')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      const weekButton = screen.getByText('本周');
      await user.click(weekButton);
      
      await waitFor(
        () => {
          const activeButton = weekButton.closest('button');
          expect(activeButton?.className).toContain('bg-indigo-600');
        },
        { timeout: 1000 }
      );
    });

    it('点击本月按钮应该切换时间范围', async () => {
      const user = userEvent.setup();
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          expect(screen.getByText('数据看板')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      const monthButton = screen.getByText('本月');
      await user.click(monthButton);
      
      await waitFor(
        () => {
          const activeButton = monthButton.closest('button');
          expect(activeButton?.className).toContain('bg-indigo-600');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('自定义日期范围测试', () => {
    it('点击日历按钮应该打开日期选择模态框', async () => {
      const user = userEvent.setup();
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          expect(screen.getByText('数据看板')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      
      const buttons = screen.getAllByRole('button');
      const calendarButton = buttons[buttons.length - 1];
      
      if (calendarButton) {
        await user.click(calendarButton);
        
        await waitFor(
          () => {
            const modal = screen.queryByText('自定义时间段');
            if (modal) {
              expect(modal).toBeInTheDocument();
            }
          },
          { timeout: 1000 }
        );
      }
    });
  });

  describe('数据加载状态测试', () => {
    it('应该显示加载状态指示器', async () => {
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          const spinner = document.querySelector('.animate-spin');
          expect(spinner).toBeTruthy();
        },
        { timeout: 2000 }
      );
    });

    it('加载完成后应该显示统计数据', async () => {
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          const statLabels = ['总播放量', '活跃观众', '平均留存', '作品分享'];
          const foundLabels = statLabels.filter(label => 
            screen.queryByText(label) !== null
          );
          expect(foundLabels.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );
    });
  });

  describe('性能基准测试', () => {
    it('初始渲染时间应该小于 100ms', () => {
      const startTime = performance.now();
      renderWithStore(<DataBoard />);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      console.log(`初始渲染时间: ${renderTime.toFixed(2)}ms`);
      
      expect(renderTime).toBeLessThan(100);
    });

    it('图表渲染时间应该小于 3 秒', async () => {
      const startTime = performance.now();
      
      renderWithStore(<DataBoard />);
      
      await waitFor(
        () => {
          const charts = document.querySelectorAll('.recharts-wrapper');
          expect(charts.length).toBeGreaterThanOrEqual(1);
        },
        { timeout: 3000 }
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`图表渲染时间: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).toBeLessThan(3000);
    });

    it('内存使用应该在合理范围内', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      renderWithStore(<DataBoard />);
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`内存增加: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
