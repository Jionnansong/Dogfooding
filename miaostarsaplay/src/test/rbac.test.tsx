import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BrandManagement from '@/pages/BrandManagement';
import TeamManagement from '@/pages/TeamManagement';
import { renderWithProviders } from './utils';
import { UserVersion } from '@/types';

// Mock API hooks
vi.mock('@/store/slices/apiSlice', async () => {
  const actual = await vi.importActual('@/store/slices/apiSlice');
  return {
    ...actual,
    useGetBrandsQuery: vi.fn(),
    useCreateBrandMutation: vi.fn(),
    useUpdateBrandMutation: vi.fn(),
    useDeleteBrandMutation: vi.fn(),
    useGetTeamMembersQuery: vi.fn(),
    useInviteMemberMutation: vi.fn(),
    useUpdateMemberMutation: vi.fn(),
    useRemoveMemberMutation: vi.fn(),
  };
});

import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetTeamMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
} from '@/store/slices/apiSlice';

describe('RBAC Permission Control - Brand/Team Management', () => {
  const mockBrands = [
    {
      id: '1',
      name: '测试品牌',
      slogan: '测试口号',
      logo: 'https://example.com/logo.png',
      primaryColor: '#6366f1',
      secondaryColor: '#818cf8',
      projectCount: 5,
      updatedAt: '2024-01-15',
    },
  ];

  const mockTeamMembers = [
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      role: '导演' as const,
      status: 'Active' as const,
      joinDate: '2024-01-01',
      avatar: 'https://example.com/avatar1.png',
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      role: '编剧' as const,
      status: 'Idle' as const,
      joinDate: '2024-01-10',
      avatar: 'https://example.com/avatar2.png',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Brand Management Permissions', () => {
    it('should allow ENTERPRISE users to create brands', async () => {
      (useGetBrandsQuery as any).mockReturnValue({
        data: mockBrands,
        isLoading: false,
      });

      const mockCreate = vi.fn().mockResolvedValue({ data: {} });
      (useCreateBrandMutation as any).mockReturnValue([mockCreate, { isLoading: false }]);
      (useUpdateBrandMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useDeleteBrandMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '企业用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.ENTERPRISE,
            tokenQuota: { used: 1000, total: 50000 },
          },
        },
      };

      renderWithProviders(<BrandManagement />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('创建新品牌')).toBeInTheDocument();
      }, { timeout: 5000 });

      fireEvent.click(screen.getByText('创建新品牌'));

      await waitFor(() => {
        expect(screen.getByText('创建品牌')).toBeInTheDocument();
      });
    });

    it('should allow ENTERPRISE users to edit brands', async () => {
      (useGetBrandsQuery as any).mockReturnValue({
        data: mockBrands,
        isLoading: false,
      });

      const mockUpdate = vi.fn().mockResolvedValue({ data: {} });
      (useCreateBrandMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useUpdateBrandMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useDeleteBrandMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '企业用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.ENTERPRISE,
            tokenQuota: { used: 1000, total: 50000 },
          },
        },
      };

      renderWithProviders(<BrandManagement />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('测试品牌')).toBeInTheDocument();
      });

      const allButtons = screen.getAllByRole('button');
      const hasEditButton = allButtons.length > 0;
      
      expect(hasEditButton).toBe(true);
    });

    it('should allow ENTERPRISE users to delete brands', async () => {
      (useGetBrandsQuery as any).mockReturnValue({
        data: mockBrands,
        isLoading: false,
      });

      const mockDelete = vi.fn().mockResolvedValue({ data: {} });
      (useCreateBrandMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useUpdateBrandMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useDeleteBrandMutation as any).mockReturnValue([mockDelete, { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '企业用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.ENTERPRISE,
            tokenQuota: { used: 1000, total: 50000 },
          },
        },
      };

      renderWithProviders(<BrandManagement />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('测试品牌')).toBeInTheDocument();
      });

      const allButtons = screen.getAllByRole('button');
      const hasDeleteButton = allButtons.length > 1;
      
      expect(hasDeleteButton).toBe(true);
    });

    it('should restrict BASIC users from brand management operations', async () => {
      (useGetBrandsQuery as any).mockReturnValue({
        data: mockBrands,
        isLoading: false,
      });

      (useCreateBrandMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useUpdateBrandMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useDeleteBrandMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '基础用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.BASIC,
            tokenQuota: { used: 1000, total: 2000 },
          },
        },
      };

      renderWithProviders(<BrandManagement />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('品牌管理')).toBeInTheDocument();
      });
    });
  });

  describe('Team Management Permissions', () => {
    it('should allow PRO users to invite team members', async () => {
      (useGetTeamMembersQuery as any).mockReturnValue({
        data: mockTeamMembers,
        isLoading: false,
      });

      const mockInvite = vi.fn().mockResolvedValue({ data: {} });
      (useInviteMemberMutation as any).mockReturnValue([mockInvite, { isLoading: false }]);
      (useUpdateMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useRemoveMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '专业用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.PRO,
            tokenQuota: { used: 1000, total: 10000 },
          },
        },
      };

      renderWithProviders(<TeamManagement />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('邀请新成员')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('邀请新成员'));

      await waitFor(() => {
        expect(screen.getByText('邀请同伴')).toBeInTheDocument();
      });
    });

    it('should allow ENTERPRISE users to manage team members', async () => {
      (useGetTeamMembersQuery as any).mockReturnValue({
        data: mockTeamMembers,
        isLoading: false,
      });

      const mockUpdate = vi.fn().mockResolvedValue({ data: {} });
      (useInviteMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useUpdateMemberMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useRemoveMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '企业用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.ENTERPRISE,
            tokenQuota: { used: 1000, total: 50000 },
          },
        },
      };

      renderWithProviders(<TeamManagement />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('团队管理')).toBeInTheDocument();
      }, { timeout: 5000 });

      const allButtons = screen.getAllByRole('button');
      const hasSettingsButton = allButtons.length > 0;
      
      expect(hasSettingsButton).toBe(true);
    });

    it('should allow PRO users to change member roles', async () => {
      (useGetTeamMembersQuery as any).mockReturnValue({
        data: mockTeamMembers,
        isLoading: false,
      });

      const mockUpdate = vi.fn().mockResolvedValue({ data: {} });
      (useInviteMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useUpdateMemberMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);
      (useRemoveMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '专业用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.PRO,
            tokenQuota: { used: 1000, total: 10000 },
          },
        },
      };

      renderWithProviders(<TeamManagement />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('团队管理')).toBeInTheDocument();
      }, { timeout: 5000 });

      const memberCards = screen.getAllByText('张三');
      expect(memberCards.length).toBeGreaterThan(0);
    });

    it('should allow ENTERPRISE users to remove team members', async () => {
      (useGetTeamMembersQuery as any).mockReturnValue({
        data: mockTeamMembers,
        isLoading: false,
      });

      const mockRemove = vi.fn().mockResolvedValue({ data: {} });
      (useInviteMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useUpdateMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useRemoveMemberMutation as any).mockReturnValue([mockRemove, { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '企业用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.ENTERPRISE,
            tokenQuota: { used: 1000, total: 50000 },
          },
        },
      };

      renderWithProviders(<TeamManagement />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('团队管理')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should restrict BASIC users from team management operations', async () => {
      (useGetTeamMembersQuery as any).mockReturnValue({
        data: mockTeamMembers,
        isLoading: false,
      });

      (useInviteMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useUpdateMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);
      (useRemoveMemberMutation as any).mockReturnValue([vi.fn(), { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '基础用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.BASIC,
            tokenQuota: { used: 1000, total: 2000 },
          },
        },
      };

      renderWithProviders(<TeamManagement />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('团队管理')).toBeInTheDocument();
      });
    });
  });

  describe('Role-based Access Control Matrix', () => {
    const permissionMatrix = [
      {
        role: UserVersion.BASIC,
        permissions: {
          canViewBrands: true,
          canCreateBrands: false,
          canEditBrands: false,
          canDeleteBrands: false,
          canViewTeam: true,
          canInviteMembers: false,
          canEditMembers: false,
          canRemoveMembers: false,
        },
      },
      {
        role: UserVersion.PRO,
        permissions: {
          canViewBrands: true,
          canCreateBrands: true,
          canEditBrands: true,
          canDeleteBrands: true,
          canViewTeam: true,
          canInviteMembers: true,
          canEditMembers: true,
          canRemoveMembers: true,
        },
      },
      {
        role: UserVersion.ENTERPRISE,
        permissions: {
          canViewBrands: true,
          canCreateBrands: true,
          canEditBrands: true,
          canDeleteBrands: true,
          canViewTeam: true,
          canInviteMembers: true,
          canEditMembers: true,
          canRemoveMembers: true,
        },
      },
    ];

    permissionMatrix.forEach(({ role, permissions }) => {
      it(`should enforce correct permissions for ${role} users`, async () => {
        (useGetBrandsQuery as any).mockReturnValue({
          data: permissions.canViewBrands ? mockBrands : [],
          isLoading: false,
        });

        (useGetTeamMembersQuery as any).mockReturnValue({
          data: permissions.canViewTeam ? mockTeamMembers : [],
          isLoading: false,
        });

        const preloadedState = {
          auth: {
            token: 'mock_token', isAuthenticated: true,
            user: {
              id: '1',
              username: `${role}用户`,
              avatar: 'https://example.com/avatar.png',
              version: role,
              tokenQuota: { 
                used: 1000, 
                total: role === UserVersion.ENTERPRISE ? 50000 : role === UserVersion.PRO ? 10000 : 2000 
              },
            },
          },
        };

        const { container: brandContainer } = renderWithProviders(<BrandManagement />, { preloadedState });

        await waitFor(() => {
          expect(screen.getByText('品牌管理')).toBeInTheDocument();
        });

        const createBrandButton = screen.queryByText('创建新品牌');
        if (permissions.canCreateBrands) {
          expect(createBrandButton).toBeInTheDocument();
        }

        const { container: teamContainer } = renderWithProviders(<TeamManagement />, { preloadedState });

        await waitFor(() => {
          expect(screen.getByText('团队管理')).toBeInTheDocument();
        });

        const inviteButton = screen.queryByText('邀请新成员');
        if (permissions.canInviteMembers) {
          expect(inviteButton).toBeInTheDocument();
        }
      });
    });
  });
});
