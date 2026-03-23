import React from 'react';
import { Calendar, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import Card from './ui/Card';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onEdit, onDelete }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: string }> = {
      shooting: { bg: 'bg-amber-50 text-amber-500 shadow-amber-100/50', text: 'bg-amber-100 text-amber-600', icon: '🎥' },
      'post-production': { bg: 'bg-blue-50 text-blue-500 shadow-blue-100/50', text: 'bg-blue-100 text-blue-600', icon: '✂️' },
      completed: { bg: 'bg-emerald-50 text-emerald-500 shadow-emerald-100/50', text: 'bg-emerald-100 text-emerald-600', icon: '✅' },
      planning: { bg: 'bg-slate-50 text-slate-400 shadow-slate-100/50', text: 'bg-slate-100 text-slate-500', icon: '📝' },
    };
    return configs[status] || configs.planning;
  };

  const statusConfig = getStatusConfig(project.status);

  return (
    <Card hover onClick={onClick} className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-5 md:mb-6">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner ${statusConfig.bg}`}>
          {statusConfig.icon}
        </div>
        <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-indigo-600 transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-rose-50 rounded-xl text-slate-300 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <h4 className="text-lg md:text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight">
        {project.title}
      </h4>
      <p className="text-xs md:text-sm text-slate-400 mb-4 line-clamp-2 min-h-[2.5rem] font-medium leading-relaxed">
        {project.description || '暂无项目描述'}
      </p>
      <p className="text-[10px] md:text-xs text-slate-400 mb-6 flex items-center gap-1.5 font-bold">
        <Calendar className="w-3.5 h-3.5" />
        {project.updatedAt} 更新
      </p>

      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex -space-x-2.5">
          {[1, 2, 3].map((i) => (
            <img
              key={i}
              src={`https://picsum.photos/40/40?random=${project.id}${i}`}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
              alt="Team"
            />
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-300 shadow-sm">
            +2
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-slate-50 text-indigo-600 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm flex items-center gap-1">
          管理 <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
