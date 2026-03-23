import { useMemo } from 'react';
import { useGetDashboardStatsQuery, useGetProjectsQuery } from '@/store/slices/apiSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface Stat {
  label: string;
  value: string | number;
  change?: number;
  type?: 'up' | 'down';
}

interface UseDashboardDataReturn {
  user: { username: string } | null;
  stats: Stat[] | undefined;
  projects:
    | {
        id: string;
        title: string;
        status: 'planning' | 'shooting' | 'post-production' | 'completed';
        updatedAt: string;
        author: string;
        description?: string;
      }[]
    | undefined;
  statsLoading: boolean;
  projectsLoading: boolean;
}

function useDashboardData(): UseDashboardDataReturn {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery(undefined);
  const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery(undefined);

  const memoizedStats = useMemo(() => {
    if (!stats) return undefined;
    return stats.map((stat) => ({
      ...stat,
      value: typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value,
    }));
  }, [stats]);

  const memoizedProjects = useMemo(() => {
    if (!projects) return undefined;
    return projects;
  }, [projects]);

  return {
    user,
    stats: memoizedStats,
    projects: memoizedProjects,
    statsLoading,
    projectsLoading,
  };
}

export default useDashboardData;
