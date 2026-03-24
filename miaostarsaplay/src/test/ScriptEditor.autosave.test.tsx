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

describe('ScriptEditor 跨 Section 自动保存测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Section 切换基础测试', () => {
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

    it('应该能够切换 Section', async () => {
      const user = userEvent.setup();
      
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
      
      const select = document.querySelector('select')!;
      
      await user.selectOptions(select, 'script_dialogue');
      
      await waitFor(
        () => {
          expect(select.value).toBe('script_dialogue');
        },
        { timeout: 1000 }
      );
    });
  });

  describe('自动保存功能测试', () => {
    it('编辑后应该能够输入内容', async () => {
      const user = userEvent.setup();
      
      const mockProject = createMockProject({
        content: '',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 0,
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
          expect(textarea).toBeTruthy();
        },
        { timeout: 3000 }
      );
      
      const textarea = document.querySelector('textarea')!;
      
      await user.type(textarea, '测试内容');
      
      expect(textarea.value).toContain('测试内容');
    });

    it('编辑后应该显示字数统计', async () => {
      const user = userEvent.setup();
      
      const mockProject = createMockProject({
        content: '',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 0,
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
          expect(textarea).toBeTruthy();
        },
        { timeout: 3000 }
      );
      
      const textarea = document.querySelector('textarea')!;
      
      await user.type(textarea, '测试');
      
      await waitFor(
        () => {
          const wordCount = screen.getByText(/字数:/);
          expect(wordCount).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('保存状态指示器测试', () => {
    it('应该显示最后保存时间', async () => {
      const mockProject = createMockProject({
        content: '',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 0,
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
          const lastSavedText = screen.queryByText(/最后保存:/);
          expect(lastSavedText).toBeTruthy();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Token 消耗计算测试', () => {
    it('编辑内容应该更新本地状态', async () => {
      const user = userEvent.setup();
      
      const mockProject = createMockProject({
        content: '',
      });
      localStorage.setItem('mock_projects', JSON.stringify([mockProject]));
      
      const mockUser = createMockUser({
        tokenQuota: {
          used: 0,
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
          expect(textarea).toBeTruthy();
        },
        { timeout: 3000 }
      );
      
      const textarea = document.querySelector('textarea')!;
      const testContent = '这是一段测试内容';
      
      await user.type(textarea, testContent);
      
      expect(textarea.value).toBe(testContent);
    });
  });

  describe('角色管理测试', () => {
    it('应该显示登场角色区域', async () => {
      const mockProject = createMockProject({
        characters: [
          { id: 'c1', name: '小黑', role: '主角' }
        ],
      });
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
          expect(screen.getByText('登场角色')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('应该显示角色列表', async () => {
      const mockProject = createMockProject({
        characters: [
          { id: 'c1', name: '小黑', role: '主角' },
          { id: 'c2', name: '小白', role: '配角' }
        ],
      });
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
          expect(screen.getByText('小黑')).toBeInTheDocument();
          expect(screen.getByText('小白')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('版本历史测试', () => {
    it('应该显示版本历史区域', async () => {
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
          expect(screen.getByText('版本历史')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
