import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, User as UserIcon } from 'lucide-react';
import Card from './ui/Card';
import ProjectCard from './ProjectCard';
import { Project } from '@/types';

interface ProjectListProps {
  projects: Project[];
  loading?: boolean;
  emptyMessage?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onEdit?: (project: Project, e: React.MouseEvent) => void;
  onDelete?: (project: Project, e: React.MouseEvent) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  loading = false,
  emptyMessage = '暂无项目',
  showViewAll = false,
  onViewAll,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      shooting: '拍摄中',
      planning: '策划中',
      completed: '已完成',
      'post-production': '后期中',
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      shooting: 'bg-amber-100 text-amber-600',
      planning: 'bg-slate-100 text-slate-500',
      completed: 'bg-emerald-100 text-emerald-600',
      'post-production': 'bg-blue-100 text-blue-600',
    };
    return classMap[status] || classMap.planning;
  };

  if (loading) {
    return (
      <Card>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card className="py-16 md:py-24 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed">
        <div className="text-5xl md:text-6xl mb-6">📂</div>
        <p className="text-lg md:text-xl font-black text-slate-600">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <>
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
            {projects.slice(0, 5).map((project) => (
              <tr
                key={project.id}
                className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/script/${project.id}`)}
              >
                <td className="py-6 font-bold text-slate-700">{project.title}</td>
                <td className="py-6">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusClass(
                      project.status
                    )}`}
                  >
                    {getStatusText(project.status)}
                  </span>
                </td>
                <td className="py-6 text-slate-400 text-xs font-mono">{project.updatedAt}</td>
                <td className="py-6 text-slate-500 text-xs font-bold">{project.author}</td>
                <td className="py-6 text-right pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-indigo-400 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {projects.slice(0, 5).map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/script/${project.id}`)}
            className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 active:bg-slate-100 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-800 line-clamp-1 flex-1">{project.title}</h4>
              <span
                className={`shrink-0 ml-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getStatusClass(
                  project.status
                )}`}
              >
                {getStatusText(project.status)}
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
        ))}
      </div>
    </>
  );
};

interface ProjectGridViewProps {
  projects: Project[];
  loading?: boolean;
  emptyMessage?: string;
  onEdit?: (project: Project, e: React.MouseEvent) => void;
  onDelete?: (project: Project, e: React.MouseEvent) => void;
}

export const ProjectGridView: React.FC<ProjectGridViewProps> = ({
  projects,
  loading = false,
  emptyMessage = '未找到相关项目',
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-white rounded-[2rem] animate-pulse border border-slate-100 shadow-sm"
          ></div>
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="col-span-full py-16 md:py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl md:rounded-[3rem] border-2 border-dashed border-slate-100 p-6 text-center">
        <div className="text-5xl md:text-6xl mb-6">🔍</div>
        <p className="text-lg md:text-xl font-black text-slate-600">{emptyMessage}</p>
        <p className="text-xs md:text-sm mt-2 font-medium">换个关键词试试，或者创建一个新项目吧。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => navigate(`/script/${project.id}`)}
          onEdit={onEdit ? (e) => onEdit(project, e) : undefined}
          onDelete={onDelete ? (e) => onDelete(project, e) : undefined}
        />
      ))}
    </div>
  );
};

export default ProjectList;
