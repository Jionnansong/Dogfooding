import React from 'react';
import { Project } from '@/types';
import { Calendar, ChevronRight, Edit3, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onClick: () => void;
}

const getStatusConfig = (status: Project['status']) => {
  const configs = {
    shooting: {
      emoji: '🎥',
      bgClass: 'bg-amber-50 text-amber-500 shadow-amber-100/50',
      label: '拍摄中',
      shortLabel: '拍摄',
      badgeClass: 'bg-amber-100 text-amber-600'
    },
    'post-production': {
      emoji: '✂️',
      bgClass: 'bg-blue-50 text-blue-500 shadow-blue-100/50',
      label: '后期中',
      shortLabel: '后期',
      badgeClass: 'bg-blue-100 text-blue-600'
    },
    completed: {
      emoji: '✅',
      bgClass: 'bg-emerald-50 text-emerald-500 shadow-emerald-100/50',
      label: '已完成',
      shortLabel: '完成',
      badgeClass: 'bg-emerald-100 text-emerald-600'
    },
    planning: {
      emoji: '📝',
      bgClass: 'bg-slate-50 text-slate-400 shadow-slate-100/50',
      label: '策划中',
      shortLabel: '策划',
      badgeClass: 'bg-slate-100 text-slate-500'
    }
  };
  return configs[status] || configs.planning;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onClick
}) => {
  const statusConfig = getStatusConfig(project.status);

  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group relative flex flex-col h-full cursor-pointer"
    >
      <div className="flex items-start justify-between mb-5 md:mb-6">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner ${statusConfig.bgClass}`}>
          {statusConfig.emoji}
        </div>
        <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onEdit}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-indigo-600 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 hover:bg-rose-50 rounded-xl text-slate-300 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
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
          {[1, 2, 3].map(i => (
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
    </div>
  );
};

interface ProjectTableRowProps {
  project: Project;
  onEdit: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export const ProjectTableRow: React.FC<ProjectTableRowProps> = ({
  project,
  onEdit,
  onClick
}) => {
  const statusConfig = getStatusConfig(project.status);

  return (
    <tr 
      className="group hover:bg-slate-50/50 transition-colors cursor-pointer" 
      onClick={onClick}
    >
      <td className="py-6 font-bold text-slate-700">{project.title}</td>
      <td className="py-6">
        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${statusConfig.badgeClass}`}>
          {statusConfig.label}
        </span>
      </td>
      <td className="py-6 text-slate-400 text-xs font-mono">{project.updatedAt}</td>
      <td className="py-6 text-slate-500 text-xs font-bold">{project.author}</td>
      <td className="py-6 text-right pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5 text-indigo-400 ml-auto" />
      </td>
    </tr>
  );
};

interface ProjectMobileCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectMobileCard: React.FC<ProjectMobileCardProps> = ({
  project,
  onClick
}) => {
  const statusConfig = getStatusConfig(project.status);

  return (
    <div 
      onClick={onClick}
      className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 active:bg-slate-100 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-800 line-clamp-1 flex-1">{project.title}</h4>
        <span className={`shrink-0 ml-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${statusConfig.badgeClass}`}>
          {statusConfig.shortLabel}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {project.updatedAt}
        </span>
        <span className="flex items-center gap-1">
          {project.author}
        </span>
      </div>
    </div>
  );
};
