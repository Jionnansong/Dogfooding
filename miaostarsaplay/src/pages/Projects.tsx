import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '@/store/slices/apiSlice';
import { Project } from '@/types';
import { useModal, useModalWithData, useProjectFilters } from '@/hooks';
import {
  PageContainer,
  Card,
  ConfirmModal,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  ProjectStatusBadge,
  LoadingSkeleton,
} from '@/components/ui';
import { Search, Plus, Calendar, Users, ChevronRight, Edit3, Trash2 } from 'lucide-react';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  // Use custom hooks for state management
  const { filteredProjects, searchTerm, setSearchTerm } = useProjectFilters(projects || []);
  const projectModal = useModalWithData<Project>();
  const deleteModal = useModalWithData<Project>();

  const [projectData, setProjectData] = useState({ title: '', desc: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreateModal = () => {
    projectModal.setData(null);
    setProjectData({ title: '', desc: '' });
    projectModal.open();
  };

  const handleOpenEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    projectModal.setData(project);
    setProjectData({ title: project.title, desc: project.description || '' });
    projectModal.open();
  };

  const handleOpenDeleteModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteModal.openWithData(project);
  };

  const handleSubmit = async () => {
    if (!projectData.title) return;
    setIsSubmitting(true);
    try {
      if (projectModal.data) {
        await updateProject({
          id: projectModal.data.id,
          changes: { title: projectData.title, description: projectData.desc },
        }).unwrap();
      } else {
        await createProject({ title: projectData.title, description: projectData.desc }).unwrap();
      }
      projectModal.close();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.data) return;
    setIsDeleting(true);
    try {
      await deleteProject(deleteModal.data.id).unwrap();
      deleteModal.close();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusIconMap: Record<string, string> = {
    shooting: '🎥',
    'post-production': '✂️',
    completed: '✅',
    planning: '📝',
  };

  const statusBgMap: Record<string, string> = {
    shooting: 'bg-amber-50 text-amber-500 shadow-amber-100/50',
    'post-production': 'bg-blue-50 text-blue-500 shadow-blue-100/50',
    completed: 'bg-emerald-50 text-emerald-500 shadow-emerald-100/50',
    planning: 'bg-slate-50 text-slate-400 shadow-slate-100/50',
  };

  return (
    <PageContainer>
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">项目中心</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm md:text-base">管理您的创作矩阵与拍摄进程</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="搜索项目..."
              className="pl-12 pr-6 py-3.5 md:py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-6 py-3.5 md:py-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Plus className="w-5 h-5" /> 新建项目
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {isLoading ? (
          <LoadingSkeleton count={6} height="h-64" className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" />
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card
              key={project.id}
              padding="lg"
              radius="xl"
              hover
              className="group relative flex flex-col h-full cursor-pointer hover:translate-y-[-4px] transition-all duration-300"
              onClick={() => navigate(`/script/${project.id}`)}
            >
              <div className="flex items-start justify-between mb-5 md:mb-6">
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner ${
                    statusBgMap[project.status] || statusBgMap.planning
                  }`}
                >
                  {statusIconMap[project.status] || statusIconMap.planning}
                </div>
                <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleOpenEditModal(project, e)}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-indigo-600 transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => handleOpenDeleteModal(project, e)}
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
          ))
        ) : (
          <div className="col-span-full py-16 md:py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl md:rounded-[3rem] border-2 border-dashed border-slate-100 p-6 text-center">
            <div className="text-5xl md:text-6xl mb-6">🔍</div>
            <p className="text-lg md:text-xl font-black text-slate-600">未找到相关项目</p>
            <p className="text-xs md:text-sm mt-2 font-medium">换个关键词试试，或者创建一个新项目吧。</p>
          </div>
        )}
      </div>

      {/* Create/Edit Project Modal */}
      <Modal isOpen={projectModal.isOpen} onClose={projectModal.close} size="lg">
        <ModalHeader
          icon={projectModal.data ? '✏️' : '📂'}
        >
          <ModalTitle
            subtitle="开启一段全新的短剧创作旅程"
          >
            {projectModal.data ? '编辑项目' : '新建项目'}
          </ModalTitle>
        </ModalHeader>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">
              项目标题
            </label>
            <input
              type="text"
              placeholder="例如：双面人生之逆袭归来"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm md:text-base"
              value={projectData.title}
              onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">
              项目简述 (可选)
            </label>
            <textarea
              placeholder="简单描述一下这个项目的核心卖点或受众..."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 h-28 md:h-32 resize-none text-sm md:text-base"
              value={projectData.desc}
              onChange={(e) => setProjectData({ ...projectData, desc: e.target.value })}
            />
          </div>
        </div>

        <ModalFooter>
          <button
            onClick={projectModal.close}
            className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!projectData.title || isSubmitting}
            className={`flex-[2] py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-indigo-100 transition-all text-sm ${
              !projectData.title || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {isSubmitting ? '处理中...' : projectModal.data ? '保存变更' : '确定创建'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="删除项目"
        message={
          <>
            您确定要删除{' '}
            <span className="font-black text-slate-800 underline decoration-rose-200">
              "{deleteModal.data?.title}"
            </span>{' '}
            吗？此操作不可撤销。
          </>
        }
        confirmText="确定删除"
        cancelText="取消"
        onConfirm={handleDelete}
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </PageContainer>
  );
};

export default Projects;
