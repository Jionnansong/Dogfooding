import { useState, useMemo, useCallback } from 'react';
import { useGetDashboardStatsQuery, useGetProjectsQuery } from '@/store/slices/apiSlice';
import { Project } from '@/types';

export interface DashboardStats {
  label: string;
  value: string | number;
  change: number;
  type: 'up' | 'down';
}

export interface UseDashboardDataReturn {
  // Stats
  stats: DashboardStats[];
  statsLoading: boolean;
  
  // Projects
  projects: Project[];
  projectsLoading: boolean;
  recentProjects: Project[];
  
  // Filtering
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProjects: Project[];
  
  // Derived state
  hasProjects: boolean;
  projectCount: number;
}

export function useDashboardData(maxRecentProjects = 5): UseDashboardDataReturn {
  // Fetch data
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: projectsData, isLoading: projectsLoading } = useGetProjectsQuery();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Process stats data
  const stats: DashboardStats[] = useMemo(() => {
    if (!statsData) return [];
    return statsData.map((stat: any) => ({
      label: stat.label,
      value: stat.value,
      change: stat.change,
      type: stat.type,
    }));
  }, [statsData]);

  // Process projects data
  const projects: Project[] = useMemo(() => {
    return projectsData || [];
  }, [projectsData]);

  // Get recent projects
  const recentProjects: Project[] = useMemo(() => {
    return projects.slice(0, maxRecentProjects);
  }, [projects, maxRecentProjects]);

  // Filter projects by search term
  const filteredProjects: Project[] = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const term = searchTerm.toLowerCase();
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(term) ||
        (project.description && project.description.toLowerCase().includes(term)) ||
        project.author.toLowerCase().includes(term)
    );
  }, [projects, searchTerm]);

  // Derived state
  const hasProjects = projects.length > 0;
  const projectCount = projects.length;

  // Memoized setter
  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    stats,
    statsLoading,
    projects,
    projectsLoading,
    recentProjects,
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    filteredProjects,
    hasProjects,
    projectCount,
  };
}
