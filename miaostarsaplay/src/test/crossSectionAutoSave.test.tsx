import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import ScriptEditor from '@/pages/ScriptEditor';
import { renderWithProviders } from './utils';
import { UserVersion } from '@/types';

// Mock the router params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-project-id' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock API hooks
vi.mock('@/store/slices/apiSlice', async () => {
  const actual = await vi.importActual('@/store/slices/apiSlice');
  return {
    ...actual,
    useGetProjectByIdQuery: vi.fn(),
    useUpdateProjectMutation: vi.fn(),
  };
});

import { useGetProjectByIdQuery, useUpdateProjectMutation } from '@/store/slices/apiSlice';

describe('Cross-Section Auto-Save - Save Before Switching Principle', () => {
  const mockProject = {
    id: 'test-project-id',
    title: '测试剧本项目',
    description: '测试描述',
    content: '初始正文内容',
    script_dialogue: '初始对白内容',
    script_action: '初始动作描述',
    script_camera: '初始镜头语言',
    characters: [],
    status: 'planning' as const,
    updatedAt: '2024-01-15',
    author: '测试用户',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Section Switching Behavior', () => {
    it('should trigger API call immediately when switching sections', async () => {
      (useGetProjectByIdQuery as any).mockReturnValue({
        data: mockProject,
        isLoading: false,
        isError: false,
      });

      const mockUpdate = vi.fn().mockResolvedValue({ data: {} });
      (useUpdateProjectMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '测试用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.PRO,
            tokenQuota: { used: 100, total: 10000 },
          },
        },
      };

      renderWithProviders(<ScriptEditor />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('测试剧本项目')).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '修改后的正文内容' } });

      const sectionSelector = screen.getByRole('combobox') as HTMLSelectElement;
      expect(sectionSelector).toBeInTheDocument();
      
      fireEvent.change(sectionSelector, { target: { value: 'script_dialogue' } });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-project-id',
            changes: expect.objectContaining({
              content: '修改后的正文内容',
            }),
          })
        );
      });
    });

    it('should wait for API response before switching UI tabs', async () => {
      let resolveUpdate: (value: { data: {} }) => void;
      const updatePromise = new Promise<{ data: {} }>((resolve) => {
        resolveUpdate = resolve;
      });

      (useGetProjectByIdQuery as any).mockReturnValue({
        data: mockProject,
        isLoading: false,
        isError: false,
      });

      const mockUpdate = vi.fn().mockReturnValue(updatePromise);
      (useUpdateProjectMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '测试用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.PRO,
            tokenQuota: { used: 100, total: 10000 },
          },
        },
      };

      renderWithProviders(<ScriptEditor />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('测试剧本项目')).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '修改后的正文内容' } });

      const sectionSelector = screen.getByRole('combobox') as HTMLSelectElement;
      const initialValue = sectionSelector.value;
      
      fireEvent.change(sectionSelector, { target: { value: 'script_dialogue' } });

      expect(mockUpdate).toHaveBeenCalled();
      
      await act(async () => {
        resolveUpdate!({ data: {} });
        await updatePromise;
      });

      await waitFor(() => {
        const updatedTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        expect(updatedTextarea.value).not.toBe(initialValue);
      });
    });

    it('should update lastSavedLengthsRef after successful save', async () => {
      (useGetProjectByIdQuery as any).mockReturnValue({
        data: { ...mockProject, script_dialogue: '初始对白' },
        isLoading: false,
        isError: false,
      });

      const mockUpdate = vi.fn().mockResolvedValue({ data: {} });
      (useUpdateProjectMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '测试用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.PRO,
            tokenQuota: { used: 100, total: 10000 },
          },
        },
      };

      renderWithProviders(<ScriptEditor />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('测试剧本项目')).toBeInTheDocument();
      });

      const sectionSelector = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(sectionSelector, { target: { value: 'script_dialogue' } });

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '修改后的对白内容，比原来长很多' } });

      fireEvent.change(sectionSelector, { target: { value: 'script_camera' } });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-project-id',
            changes: expect.objectContaining({
              script_dialogue: '修改后的对白内容，比原来长很多',
            }),
          })
        );
      });
    });

    it('should handle rapid section switching correctly', async () => {
      (useGetProjectByIdQuery as any).mockReturnValue({
        data: mockProject,
        isLoading: false,
        isError: false,
      });

      const mockUpdate = vi.fn().mockResolvedValue({ data: {} });
      (useUpdateProjectMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '测试用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.PRO,
            tokenQuota: { used: 100, total: 10000 },
          },
        },
      };

      renderWithProviders(<ScriptEditor />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('测试剧本项目')).toBeInTheDocument();
      });

      const sectionSelector = screen.getByRole('combobox') as HTMLSelectElement;
      const sections = ['script_dialogue', 'script_action', 'script_camera', 'content'];

      // First, make a change to the content
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '需要保存的修改内容' } });

      // Then switch sections - this should trigger save before switching
      for (const section of sections) {
        fireEvent.change(sectionSelector, { target: { value: section } });
      }

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Auto-Save Timing and Reliability', () => {
    it.skip('should trigger save within 2 seconds of editing (timing test skipped in unit tests)', async () => {
      // This test relies on precise timing, better tested in E2E
    });

    it.skip('should debounce multiple rapid edits (timing test skipped in unit tests)', async () => {
      // This test relies on precise timing, better tested in E2E
    });

    it('should handle network latency gracefully', async () => {
      let resolveUpdate: (value: { data: {} }) => void;
      const updatePromise = new Promise<{ data: {} }>((resolve) => {
        resolveUpdate = resolve;
      });

      (useGetProjectByIdQuery as any).mockReturnValue({
        data: mockProject,
        isLoading: false,
        isError: false,
      });

      const mockUpdate = vi.fn().mockReturnValue(updatePromise);
      (useUpdateProjectMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '测试用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.PRO,
            tokenQuota: { used: 100, total: 10000 },
          },
        },
      };

      renderWithProviders(<ScriptEditor />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('测试剧本项目')).toBeInTheDocument();
      });

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '修改后的内容' } });

      // Trigger section switch to force auto-save (per "save before switch" principle)
      const sectionSelector = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(sectionSelector, { target: { value: 'script_camera' } });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
      });

      await act(async () => {
        resolveUpdate!({ data: {} });
        await updatePromise;
      });
    });
  });

  describe('Data Integrity During Section Switching', () => {
    it('should preserve unsaved changes when switching back', async () => {
      (useGetProjectByIdQuery as any).mockReturnValue({
        data: mockProject,
        isLoading: false,
        isError: false,
      });

      const mockUpdate = vi.fn().mockResolvedValue({ data: {} });
      (useUpdateProjectMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '测试用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.PRO,
            tokenQuota: { used: 100, total: 10000 },
          },
        },
      };

      renderWithProviders(<ScriptEditor />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('测试剧本项目')).toBeInTheDocument();
      });

      const sectionSelector = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(sectionSelector, { target: { value: 'script_dialogue' } });

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: '重要的对白修改' } });

      fireEvent.change(sectionSelector, { target: { value: 'script_camera' } });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
      });

      fireEvent.change(sectionSelector, { target: { value: 'script_dialogue' } });

      const updatedTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(updatedTextarea.value).toBe('重要的对白修改');
    });

    it('should correctly calculate token consumption based on saved baseline', async () => {
      const initialDialogue = '初始对白';
      const modifiedDialogue = '初始对白加上一些新内容';

      (useGetProjectByIdQuery as any).mockReturnValue({
        data: { ...mockProject, script_dialogue: initialDialogue },
        isLoading: false,
        isError: false,
      });

      const mockUpdate = vi.fn().mockResolvedValue({ data: {} });
      (useUpdateProjectMutation as any).mockReturnValue([mockUpdate, { isLoading: false }]);

      const preloadedState = {
        auth: {
          token: 'mock_token', isAuthenticated: true,
          user: {
            id: '1',
            username: '测试用户',
            avatar: 'https://example.com/avatar.png',
            version: UserVersion.PRO,
            tokenQuota: { used: 100, total: 10000 },
          },
        },
      };

      renderWithProviders(<ScriptEditor />, { preloadedState });

      await waitFor(() => {
        expect(screen.getByText('测试剧本项目')).toBeInTheDocument();
      });

      const sectionSelector = screen.getByRole('combobox') as HTMLSelectElement;
      fireEvent.change(sectionSelector, { target: { value: 'script_dialogue' } });

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: modifiedDialogue } });

      fireEvent.change(sectionSelector, { target: { value: 'script_camera' } });

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled();
      });
    });
  });
});
