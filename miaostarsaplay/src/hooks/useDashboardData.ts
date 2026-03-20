import { useMemo, useState } from 'react';
import { useGetDashboardStatsQuery, useGetProjectsQuery } from '@/store/slices/apiSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Project, DataMetric } from '@/types';

interface UseDashboardDataReturn {
  user: ReturnType<typeof useSelector<(state: RootState) => { username: string }>> extends infer T ? T : never;
  stats: DataMetric[] | undefined;
  projects: Project[] | undefined;
  statsLoading: boolean;
  projectsLoading: boolean;
  recentProjects: Project[] | undefined;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery();

  const recentProjects = useMemo(() => {
    return projects?.slice(0, 5);
  }, [projects]);

  return {
    user,
    stats,
    projects,
    statsLoading,
    projectsLoading,
    recentProjects
  } as UseDashboardDataReturn;
};

interface UseProjectFilterReturn {
  filteredProjects: Project[] | undefined;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const useProjectFilter = (
  projects: Project[] | undefined
): UseProjectFilterReturn => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = useMemo(() => {
    if (!projects || !searchTerm) return projects;
    return projects.filter((p: Project) => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  return { filteredProjects, searchTerm, setSearchTerm };
};
