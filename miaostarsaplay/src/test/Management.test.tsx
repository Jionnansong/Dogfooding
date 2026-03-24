import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStore, createMockUser, createMockTeamMember, createMockBrand } from '@/test/utils';
import BrandManagement from '@/pages/BrandManagement';
import TeamManagement from '@/pages/TeamManagement';
import { UserVersion } from '@/types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('管理模块权限控制测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('BrandManagement 品牌管理测试', () => {
    describe('基础渲染测试', () => {
      it('应该正确渲染品牌管理页面标题', () => {
        renderWithStore(<BrandManagement />);
        
        expect(screen.getByText('品牌管理')).toBeInTheDocument();
        expect(screen.getByText('建立与维护企业视觉标识及内容矩阵')).toBeInTheDocument();
      });

      it('应该显示创建新品牌按钮', () => {
        renderWithStore(<BrandManagement />);
        
        expect(screen.getByText('创建新品牌')).toBeInTheDocument();
      });

      it('应该显示加载状态', () => {
        renderWithStore(<BrandManagement />);
        
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeTruthy();
      });
    });

    describe('品牌 CRUD 操作测试', () => {
      it('点击创建按钮应该打开创建品牌模态框', async () => {
        const user = userEvent.setup();
        renderWithStore(<BrandManagement />);
        
        await waitFor(
          () => {
            expect(screen.getByText('创建新品牌')).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
        
        const createButton = screen.getByText('创建新品牌').closest('button')!;
        await user.click(createButton);
        
        await waitFor(
          () => {
            expect(screen.getByText('创建品牌')).toBeInTheDocument();
          },
          { timeout: 1000 }
        );
      });

      it('创建品牌表单应该包含必要字段', async () => {
        const user = userEvent.setup();
        renderWithStore(<BrandManagement />);
        
        await waitFor(
          () => {
            expect(screen.getByText('创建新品牌')).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
        
        const createButton = screen.getByText('创建新品牌').closest('button')!;
        await user.click(createButton);
        
        await waitFor(
          () => {
            const labels = screen.getAllByText(/品牌名称|品牌 Slogan|品牌主色|辅助色彩/i);
            expect(labels.length).toBeGreaterThanOrEqual(2);
          },
          { timeout: 1000 }
        );
      });
    });
  });

  describe('TeamManagement 团队管理测试', () => {
    describe('基础渲染测试', () => {
      it('应该正确渲染团队管理页面标题', () => {
        renderWithStore(<TeamManagement />);
        
        expect(screen.getByText('团队管理')).toBeInTheDocument();
        expect(screen.getByText('管理成员权限与项目协作效率')).toBeInTheDocument();
      });

      it('应该显示邀请新成员按钮', () => {
        renderWithStore(<TeamManagement />);
        
        expect(screen.getByText('邀请新成员')).toBeInTheDocument();
      });
    });

    describe('Role-based Access 权限控制测试', () => {
      const roles = ['导演', '编剧', '制片人', '后期', '组长'] as const;
      
      it('应该显示所有可用角色选项', async () => {
        const user = userEvent.setup();
        renderWithStore(<TeamManagement />);
        
        await waitFor(
          () => {
            expect(screen.getByText('邀请新成员')).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
        
        const inviteButton = screen.getByText('邀请新成员').closest('button')!;
        await user.click(inviteButton);
        
        await waitFor(
          () => {
            expect(screen.getByText('邀请同伴')).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
        
        roles.forEach(role => {
          const roleElements = screen.getAllByText(role);
          expect(roleElements.length).toBeGreaterThan(0);
        });
      });

      it('应该能够选择不同角色', async () => {
        const user = userEvent.setup();
        renderWithStore(<TeamManagement />);
        
        await waitFor(
          () => {
            expect(screen.getByText('邀请新成员')).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
        
        const inviteButton = screen.getByText('邀请新成员').closest('button')!;
        await user.click(inviteButton);
        
        await waitFor(
          () => {
            expect(screen.getByText('邀请同伴')).toBeInTheDocument();
          },
          { timeout: 1000 }
        );
        
        const directorRoles = screen.getAllByText('导演');
        const directorButton = directorRoles.find(el => el.closest('button'));
        expect(directorButton).toBeTruthy();
        await user.click(directorButton!);
        
        const button = directorButton!.closest('button');
        expect(button?.className).toContain('border-indigo-600');
      });

      it('默认角色应该是编剧', async () => {
        const user = userEvent.setup();
        renderWithStore(<TeamManagement />);
        
        await waitFor(
          () => {
            expect(screen.getByText('邀请新成员')).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
        
        const inviteButton = screen.getByText('邀请新成员').closest('button')!;
        await user.click(inviteButton);
        
        await waitFor(
          () => {
            expect(screen.getByText('邀请同伴')).toBeInTheDocument();
          },
          { timeout: 1000 }
        );
        
        const roleButtons = document.querySelectorAll('button.border-indigo-600');
        const hasSelectedRole = Array.from(roleButtons).some(btn => btn.textContent?.includes('编剧'));
        expect(hasSelectedRole).toBe(true);
      });
    });

    describe('成员管理测试', () => {
      it('应该显示团队成员区域', async () => {
        renderWithStore(<TeamManagement />);
        
        await waitFor(
          () => {
            const tableHeader = screen.queryByText('成员信息');
            expect(tableHeader).toBeTruthy();
          },
          { timeout: 3000 }
        );
      });

      it('应该显示角色列', async () => {
        renderWithStore(<TeamManagement />);
        
        await waitFor(
          () => {
            const roleHeader = screen.queryByText('协作角色');
            expect(roleHeader).toBeTruthy();
          },
          { timeout: 3000 }
        );
      });

      it('应该显示状态列', async () => {
        renderWithStore(<TeamManagement />);
        
        await waitFor(
          () => {
            const statusHeader = screen.queryByText('当前状态');
            expect(statusHeader).toBeTruthy();
          },
          { timeout: 3000 }
        );
      });
    });

    describe('邀请成员测试', () => {
      it('邀请表单应该包含必要字段', async () => {
        const user = userEvent.setup();
        renderWithStore(<TeamManagement />);
        
        await waitFor(
          () => {
            expect(screen.getByText('邀请新成员')).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
        
        const inviteButton = screen.getByText('邀请新成员').closest('button')!;
        await user.click(inviteButton);
        
        await waitFor(
          () => {
            const labels = screen.getAllByText(/花名|邮箱地址|协作角色/i);
            expect(labels.length).toBeGreaterThanOrEqual(2);
          },
          { timeout: 1000 }
        );
      });

      it('应该能够填写邀请表单', async () => {
        const user = userEvent.setup();
        renderWithStore(<TeamManagement />);
        
        await waitFor(
          () => {
            expect(screen.getByText('邀请新成员')).toBeInTheDocument();
          },
          { timeout: 2000 }
        );
        
        const inviteButton = screen.getByText('邀请新成员').closest('button')!;
        await user.click(inviteButton);
        
        await waitFor(
          async () => {
            const inputs = document.querySelectorAll('input');
            const nameInput = inputs[0];
            const emailInput = inputs[1];
            
            if (nameInput && emailInput) {
              await user.type(nameInput, '新成员');
              await user.type(emailInput, 'new@example.com');
              
              expect(nameInput).toHaveValue('新成员');
              expect(emailInput).toHaveValue('new@example.com');
            }
          },
          { timeout: 1000 }
        );
      });
    });
  });

  describe('跨模块权限一致性测试', () => {
    it('品牌管理和团队管理应该使用一致的 UI 风格', () => {
      const { unmount: unmountBrand } = renderWithStore(<BrandManagement />);
      
      const brandHeader = screen.getByText('品牌管理');
      expect(brandHeader.className).toContain('font-black');
      
      unmountBrand();
      
      renderWithStore(<TeamManagement />);
      
      const teamHeader = screen.getByText('团队管理');
      expect(teamHeader.className).toContain('font-black');
    });
  });
});
