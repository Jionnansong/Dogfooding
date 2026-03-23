import React from 'react';
import { Search, Plus } from 'lucide-react';
import { useGetProjectsQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation } from '@/store/slices/apiSlice';
import { ProjectGridView } from '@/components/ProjectList';
import FormModal from '@/components/FormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { useModal, useFilter } from '@/hooks';
import { Project } from '@/types';

const Projects: React.FC = () => {
  const { data: projects, isLoading } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const createModal = useModal();
  const editModal = useModal<Project>();
  const deleteModal = useModal<Project>();

  const { filteredData: filteredProjects, filter, setFilter } = useFilter({
    data: projects,
    filterKeys: ['title', 'description', 'author'],
  });

  const handleCreateSubmit = async (values: Record<string, string>) => {
    await createProject({ title: values.title, description: values.desc }).unwrap();
  };

  const handleEditSubmit = async (values: Record<string, string>) => {
    if (!editModal.data) return;
    await updateProject({
      id: editModal.data.id,
      changes: { title: values.title, description: values.desc },
    }).unwrap();
  };

  const handleDelete = async () => {
    if (!deleteModal.data) return;
    await deleteProject(deleteModal.data.id).unwrap();
  };

  const formFields = [
    {
      name: 'title',
      label: '项目标题',
      placeholder: '例如：双面人生之逆袭归来',
      required: true,
    },
    {
      name: 'desc',
      label: '项目简述 (可选)',
      type: 'textarea' as const,
      placeholder: '简单描述一下这个项目的核心卖点或受众...',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <button
            onClick={createModal.open}
            className="px-6 py-3.5 md:py-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Plus className="w-5 h-5" /> 新建项目
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <ProjectGridView
        projects={filteredProjects}
        loading={isLoading}
        onEdit={(project, e) => editModal.open(project)}
        onDelete={(project, e) => deleteModal.open(project)}
      />

      {/* Create Project Modal */}
      <FormModal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="新建项目"
        subtitle="开启一段全新的短剧创作旅程"
        icon="📂"
        fields={formFields}
        onSubmit={handleCreateSubmit}
        submitLabel="确定创建"
      />

      {/* Edit Project Modal */}
      <FormModal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="编辑项目"
        subtitle="修改项目信息"
        icon="✏️"
        fields={formFields}
        initialValues={{
          title: editModal.data?.title || '',
          desc: editModal.data?.description || '',
        }}
        onSubmit={handleEditSubmit}
        submitLabel="保存变更"
      />

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
        confirmLabel="确定删除"
        type="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Projects;
