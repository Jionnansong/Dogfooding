import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, User as UserIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card';
import { Project } from '@/types';
import { cn } from '@/utils/cn';

interface ProjectListProps {
  projects: Project[];
  loading?: boolean;
  maxItems?: number;
  className?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const statusConfig: Record<string, { label: string; shortLabel: string; bg: string; text: string }> = {
  shooting: { label: '拍摄中', shortLabel: '拍摄', bg: 'bg-amber-100', text: 'text-amber-600' },
  planning: { label: '策划中', shortLabel: '策划', bg: 'bg-slate-100', text: 'text-slate-500' },
  completed: { label: '已完成', shortLabel: '完成', bg: 'bg-emerald-100', text: 'text-emerald-600' },
  'post-production': { label: '后期中', shortLabel: '后期', bg: 'bg-blue-100', text: 'text-blue-600' },
};

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading = false,
  maxItems = 5,
  className,
  showViewAll = true,
  onViewAll,
}) => {
  const navigate = useNavigate();
  const displayProjects = projects?.slice(0, maxItems) || [];

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate('/project');
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/script/${projectId}`);
  };

  if (loading) {
    return (
      <Card className={className} padding="lg">
        <CardHeader>
          <CardTitle>最近项目</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={className} padding="lg" radius="xl">
      <CardHeader>
        <CardTitle
          action={
            showViewAll && (
              <button
                onClick={handleViewAll}
                className="text-indigo-600 font-black text-xs md:text-sm hover:underline flex items-center gap-1"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            )
          }
        >
          最近项目
        </CardTitle>
      </CardHeader>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50">
              <th className="pb-5 font-black">项目名称</th>
              <th className="pb-5 font-black">状态</th>
              <th className="pb-5 font-black">更新日期</th>
              <th className="pb-5 font-black">负责人</th>
              <th className="pb-5 font-black text-right pr-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayProjects.map((project) => {
              const status = statusConfig[project.status] || statusConfig.planning;
              return (
                <tr
                  key={project.id}
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <td className="py-6 font-bold text-slate-700">{project.title}</td>
                  <td className="py-6">
                    <span
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider',
                        status.bg,
                        status.text
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="py-6 text-slate-400 text-xs font-mono">{project.updatedAt}</td>
                  <td className="py-6 text-slate-500 text-xs font-bold">{project.author}</td>
                  <td className="py-6 text-right pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-indigo-400 ml-auto" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-4">
        {displayProjects.map((project) => {
          const status = statusConfig[project.status] || statusConfig.planning;
          return (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 active:bg-slate-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-800 line-clamp-1 flex-1">{project.title}</h4>
                <span
                  className={cn(
                    'shrink-0 ml-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest',
                    status.bg,
                    status.text
                  )}
                >
                  {status.shortLabel}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {project.updatedAt}
                </span>
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" /> {project.author}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

interface ProjectListItemProps {
  project: Project;
  onClick?: () => void;
  className?: string;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onClick, className }) => {
  const status = statusConfig[project.status] || statusConfig.planning;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-slate-50/50 p-4 rounded-xl border border-slate-100 active:bg-slate-100 transition-colors cursor-pointer',
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-800 line-clamp-1 flex-1">{project.title}</h4>
        <span
          className={cn(
            'shrink-0 ml-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest',
            status.bg,
            status.text
          )}
        >
          {status.shortLabel}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {project.updatedAt}
        </span>
        <span className="flex items-center gap-1">
          <UserIcon className="w-3 h-3" /> {project.author}
        </span>
      </div>
    </div>
  );
};
