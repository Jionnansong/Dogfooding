import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetProjectsQuery, 
  useCreateProjectMutation, 
  useUpdateProjectMutation, 
  useDeleteProjectMutation 
} from '@/store/slices/apiSlice';
import { Project } from '@/types';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { Card, PageHeader, EmptyState, Modal, ModalActions, ModalButton, FormField, Input, Textarea } from '@/components/ui';
import { ProjectCard } from '@/components';
import { useModal, useFormModal } from '@/hooks';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formModal = useFormModal<Project>();
  const deleteModal = useModal();

  const [projectData, setProjectData] = useState({ title: '', desc: '' });

  const filteredProjects = projects?.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setProjectData({ title: '', desc: '' });
    formModal.open(null);
  };

  const handleOpenEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectData({ title: project.title, desc: project.description || '' });
    formModal.open(project);
  };

  const handleOpenDeleteModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    formModal.open(project);
    deleteModal.open();
  };

  const handleSubmit = async () => {
    if (!projectData.title) return;
    setIsSubmitting(true);
    try {
      if (formModal.data) {
        await updateProject({ 
          id: formModal.data.id, 
          changes: { title: projectData.title, description: projectData.desc } 
        }).unwrap();
      } else {
        await createProject({ title: projectData.title, description: projectData.desc }).unwrap();
      }
      formModal.close();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!formModal.data) return;
    setIsDeleting(true);
    try {
      await deleteProject(formModal.data.id).unwrap();
      deleteModal.close();
      formModal.close();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="项目中心"
        subtitle="管理您的创作矩阵与拍摄进程"
        actions={
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
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-[2rem] animate-pulse border border-slate-100 shadow-sm"></div>
          ))
        ) : filteredProjects && filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(e) => handleOpenEditModal(project, e)}
              onDelete={(e) => handleOpenDeleteModal(project, e)}
              onClick={() => navigate(`/script/${project.id}`)}
            />
          ))
        ) : (
          <EmptyState
            icon="🔍"
            title="未找到相关项目"
            description="换个关键词试试，或者创建一个新项目吧。"
          />
        )}
      </div>

      <Modal
        isOpen={formModal.isOpen && !deleteModal.isOpen}
        onClose={formModal.close}
        title={formModal.data ? '编辑项目' : '新建项目'}
        subtitle="开启一段全新的短剧创作旅程"
        icon={formModal.data ? '✏️' : '📂'}
      >
        <div className="space-y-5">
          <FormField label="项目标题">
            <Input 
              placeholder="例如：双面人生之逆袭归来" 
              value={projectData.title}
              onChange={e => setProjectData({...projectData, title: e.target.value})}
              autoFocus
            />
          </FormField>
          <FormField label="项目简述 (可选)">
            <Textarea 
              placeholder="简单描述一下这个项目的核心卖点或受众..." 
              value={projectData.desc}
              onChange={e => setProjectData({...projectData, desc: e.target.value})}
            />
          </FormField>
        </div>

        <ModalActions>
          <ModalButton variant="secondary" onClick={formModal.close}>
            取消
          </ModalButton>
          <ModalButton 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!projectData.title || isSubmitting}
            loading={isSubmitting}
          >
            {formModal.data ? '保存变更' : '确定创建'}
          </ModalButton>
        </ModalActions>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        maxWidth="max-w-md"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl md:text-4xl mx-auto mb-6 shadow-inner">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">删除项目</h3>
          <p className="text-slate-500 mb-8 leading-relaxed font-medium text-sm md:text-base">
            您确定要删除 <span className="font-black text-slate-800 underline decoration-rose-200">"{formModal.data?.title}"</span> 吗？此操作不可撤销。
          </p>

          <ModalActions>
            <ModalButton variant="secondary" onClick={deleteModal.close}>
              取消
            </ModalButton>
            <ModalButton 
              variant="danger" 
              onClick={handleDelete}
              loading={isDeleting}
            >
              确定删除
            </ModalButton>
          </ModalActions>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
