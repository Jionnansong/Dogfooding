import { useState, useMemo, useCallback } from 'react';
import { Project } from '@/types';

export type ProjectStatus = 'all' | 'planning' | 'shooting' | 'post-production' | 'completed';
export type ProjectSortBy = 'updatedAt' | 'title' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface UseProjectFiltersReturn {
  // Filter state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: ProjectStatus;
  setStatusFilter: (status: ProjectStatus) => void;
  sortBy: ProjectSortBy;
  setSortBy: (sort: ProjectSortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  toggleSortOrder: () => void;
  
  // Filtered and sorted results
  filteredProjects: Project[];
  
  // Reset
  resetFilters: () => void;
  
  // Stats
  totalCount: number;
  filteredCount: number;
}

export function useProjectFilters(projects: Project[] = []): UseProjectFiltersReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>('all');
  const [sortBy, setSortBy] = useState<ProjectSortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(term) ||
          (project.description && project.description.toLowerCase().includes(term)) ||
          project.author.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((project) => project.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'updatedAt':
        default:
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [projects, searchTerm, statusFilter, sortBy, sortOrder]);

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('updatedAt');
    setSortOrder('desc');
  }, []);

  return {
    searchTerm,
    setSearchTerm: useCallback((term: string) => setSearchTerm(term), []),
    statusFilter,
    setStatusFilter: useCallback((status: ProjectStatus) => setStatusFilter(status), []),
    sortBy,
    setSortBy: useCallback((sort: ProjectSortBy) => setSortBy(sort), []),
    sortOrder,
    setSortOrder: useCallback((order: SortOrder) => setSortOrder(order), []),
    toggleSortOrder,
    filteredProjects,
    resetFilters,
    totalCount: projects.length,
    filteredCount: filteredProjects.length,
  };
}
