import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore, createMockUser, createMockProject } from '@/test/utils';
import ScriptEditor from '@/pages/ScriptEditor';
import { UserVersion } from '@/types';

const mockNavigate = vi.fn();
const mockParams = { id: 'test-project-1' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

describe('ScriptEditor 剧本编辑器高压测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('基础渲染测试', () => {
    it('应该正确加载项目数据', async () => {
      const mockProject = createMockProject();
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser();
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          expect(screen.getByText(mockProject.title)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('应该显示编辑器区域', async () => {
      const mockProject = createMockProject();
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser();
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          const textarea = document.querySelector('textarea');
          expect(textarea).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('高压测试：Token Quota 耗尽场景', () => {
    it('当 tokenQuota.used >= tokenQuota.total 时，编辑器应该进入 ReadOnly 模式', async () => {
      const contentLength = 100;
      const mockProject = createMockProject({
        content: 'a'.repeat(contentLength),
        script_dialogue: '',
        script_action: '',
        script_camera: '',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 10000,
          total: 10000,
        },
      });
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          const textarea = document.querySelector('textarea');
          expect(textarea?.hasAttribute('readOnly')).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('当配额耗尽时，应该显示 ShieldAlert 只读模式提示', async () => {
      const mockProject = createMockProject({
        content: '测试内容',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 10000,
          total: 10000,
        },
      });
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('只读模式')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('当配额耗尽时，应该自动弹出 QuotaModal', async () => {
      const mockProject = createMockProject({
        content: '测试内容',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 10000,
          total: 10000,
        },
      });
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('Token 额度已耗尽')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('QuotaModal 应该显示当前配额信息', async () => {
      const mockProject = createMockProject({
        content: '测试内容',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 10000,
          total: 10000,
        },
      });
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('10000')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('QuotaModal 应该包含升级按钮', async () => {
      const mockProject = createMockProject({
        content: '测试内容',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 10000,
          total: 10000,
        },
      });
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('立即升级套餐')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('QuotaModal 应该包含稍后再说按钮', async () => {
      const mockProject = createMockProject({
        content: '测试内容',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 10000,
          total: 10000,
        },
      });
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('稍后再说')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('QuotaModal 交互测试', () => {
    it('点击稍后再说应该关闭 QuotaModal', async () => {
      const user = userEvent.setup();
      
      const mockProject = createMockProject({
        content: '',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 10000,
          total: 10000,
        },
      });
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('Token 额度已耗尽')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
      
      const laterButton = screen.getByText('稍后再说');
      await user.click(laterButton);
      
      await waitFor(
        () => {
          expect(screen.queryByText('Token 额度已耗尽')).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('点击升级套餐应该导航到登录页', async () => {
      const user = userEvent.setup();
      
      const mockProject = createMockProject({
        content: '',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 10000,
          total: 10000,
        },
      });
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          expect(screen.getByText('立即升级套餐')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
      
      const upgradeButton = screen.getByText('立即升级套餐');
      await user.click(upgradeButton);
      
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/login');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Section 切换测试', () => {
    it('应该显示 Section 选择器', async () => {
      const mockProject = createMockProject();
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser();
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          const select = document.querySelector('select');
          expect(select).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });

    it('默认应该选中正文文本 Section', async () => {
      const mockProject = createMockProject();
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser();
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'test-token');
      
      renderWithStore(<ScriptEditor />, {
        auth: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
        },
      });
      
      await waitFor(
        () => {
          const select = document.querySelector('select');
          expect(select?.value).toBe('content');
        },
        { timeout: 3000 }
      );
    });
  });
});
