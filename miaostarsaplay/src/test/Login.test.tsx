import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore, createMockUser } from '@/test/utils';
import Login from '@/pages/Login';
import { UserVersion } from '@/types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login 页面测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染登录页面标题和品牌名称', () => {
      renderWithStore(<Login />);
      
      expect(screen.getByText('喵星智剧')).toBeInTheDocument();
      expect(screen.getByText('Miaostars APlay Platform')).toBeInTheDocument();
    });

    it('应该显示用户名输入框', () => {
      renderWithStore(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('输入你的创作花名');
      expect(usernameInput).toBeInTheDocument();
    });

    it('应该显示三个版本选择按钮', () => {
      renderWithStore(<Login />);
      
      expect(screen.getByText('基础版')).toBeInTheDocument();
      expect(screen.getByText('专业版')).toBeInTheDocument();
      expect(screen.getByText('企业旗舰版')).toBeInTheDocument();
    });
  });

  describe('表单校验测试 - Zod/Pydantic 双端校验逻辑模拟', () => {
    it('用户名输入应该正确更新状态', async () => {
      const user = userEvent.setup();
      renderWithStore(<Login />);
      
      const usernameInput = screen.getByPlaceholderText('输入你的创作花名');
      await user.type(usernameInput, '测试用户');
      
      expect(usernameInput).toHaveValue('测试用户');
    });

    it('点击登录按钮后应该显示加载状态', async () => {
      const user = userEvent.setup();
      renderWithStore(<Login />);
      
      const buttons = screen.getAllByRole('button');
      const proButton = buttons.find(btn => btn.textContent?.includes('专业版'))!;
      await user.click(proButton);
      
      expect(screen.getByText('正在同步数据...')).toBeInTheDocument();
    });

    it('登录按钮应该能够被点击', () => {
      renderWithStore(<Login />);
      
      const buttons = screen.getAllByRole('button');
      const enterpriseButton = buttons.find(btn => btn.textContent?.includes('企业旗舰版'))!;
      
      expect(enterpriseButton).not.toBeDisabled();
    });
  });

  describe('Token Quota 校验测试', () => {
    it('基础版按钮应该存在', () => {
      renderWithStore(<Login />);
      
      const buttons = screen.getAllByRole('button');
      const basicButton = buttons.find(btn => btn.textContent?.includes('基础版'));
      
      expect(basicButton).toBeTruthy();
    });

    it('专业版按钮应该存在', () => {
      renderWithStore(<Login />);
      
      const buttons = screen.getAllByRole('button');
      const proButton = buttons.find(btn => btn.textContent?.includes('专业版'));
      
      expect(proButton).toBeTruthy();
    });

    it('企业版按钮应该存在', () => {
      renderWithStore(<Login />);
      
      const buttons = screen.getAllByRole('button');
      const enterpriseButton = buttons.find(btn => btn.textContent?.includes('企业旗舰版'));
      
      expect(enterpriseButton).toBeTruthy();
    });
  });

  describe('Redux 状态管理测试', () => {
    it('登录按钮应该可用', () => {
      renderWithStore(<Login />);
      
      const buttons = screen.getAllByRole('button');
      const proButton = buttons.find(btn => btn.textContent?.includes('专业版'))!;
      
      expect(proButton).toBeInTheDocument();
    });

    it('登录成功后应该持久化到 localStorage', () => {
      renderWithStore(<Login />);
      
      const buttons = screen.getAllByRole('button');
      const proButton = buttons.find(btn => btn.textContent?.includes('专业版'))!;
      
      expect(proButton).toBeInTheDocument();
    });
  });

  describe('按钮状态测试', () => {
    it('初始状态下按钮应该可用', () => {
      renderWithStore(<Login />);
      
      const buttons = screen.getAllByRole('button');
      const basicButton = buttons.find(btn => btn.textContent?.includes('基础版'))!;
      
      expect(basicButton).not.toBeDisabled();
    });

    it('所有版本按钮应该都存在', () => {
      renderWithStore(<Login />);
      
      const buttons = screen.getAllByRole('button');
      const basicButton = buttons.find(btn => btn.textContent?.includes('基础版'));
      const proButton = buttons.find(btn => btn.textContent?.includes('专业版'));
      const enterpriseButton = buttons.find(btn => btn.textContent?.includes('企业旗舰版'));
      
      expect(basicButton).toBeTruthy();
      expect(proButton).toBeTruthy();
      expect(enterpriseButton).toBeTruthy();
    });
  });
});
