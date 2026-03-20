import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardStatsQuery, useGetProjectsQuery } from '@/store/slices/apiSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ChevronRight, Clock, User as UserIcon } from 'lucide-react';
import { Card, StatCard } from '@/components/ui';
import { ProjectTableRow, ProjectMobileCard, TutorialModal, TutorialItem } from '@/components';
import { useModal } from '@/hooks';

const TUTORIALS: TutorialItem[] = [
  { 
    id: 'quick-start',
    title: '快速启动剧本', 
    desc: '如何从剧本大纲开始构建第一幕场景，梳理核心戏剧冲突点。', 
    icon: '⚡',
    content: {
      sections: [
        { subtitle: '黄金3秒原则', body: '短剧的第一镜必须具备强视觉冲击力或悬念。避免冗长的背景铺垫，直接将主角置入危机或巨大反差中。' },
        { subtitle: '钩子设置', body: '每一集结束时必须留有"钩子"。例如：身份暴露的瞬间、致命误会的产生或突如其来的危机。' }
      ],
      tips: ['先写大纲再填充细节', '每一个场景都要服务于核心冲突', '删除所有不推动情节的废话']
    }
  },
  { 
    id: 'dialogue',
    title: '对白润色技巧', 
    desc: '学习如何针对不同角色性格设定专属的对话逻辑，增加台词的张力。', 
    icon: '🎭',
    content: {
      sections: [
        { subtitle: '潜台词的力量', body: '不要让角色直接说出心里话。通过正话反说、避重就轻或重复关键词来展现人物内心复杂的斗争。' },
        { subtitle: '节奏感与留白', body: '对话的节奏应有起伏。高潮处台词要短促有力，情感细腻处则可以适当增加动作描写替代语言。' }
      ],
      tips: ['读出你的台词，确保它听起来像人话', '给每个角色设定2-3个常用词根', '少用形容词，多用动词']
    }
  },
  { 
    id: 'versioning',
    title: '多版本剧本管理', 
    desc: '在项目中如何高效管理不同创作阶段的草稿，利用版本功能找回最佳点。', 
    icon: '📂',
    content: {
      sections: [
        { subtitle: '版本命名规范', body: '建议采用"日期_状态_负责人"的命名方式。例如：231025_初稿_喵酱。避免使用"最终版1"、"绝对不改版"等模糊词汇。' },
        { subtitle: '增量备份逻辑', body: '每当进行大的剧情分歧点创作时，请务必创建一个新的副本。这能让你在创意走进死胡同时快速回滚。' }
      ],
      tips: ['定期清理过期草稿', '在备注中记录每个版本修改的核心点', '善用云端同步功能']
    }
  },
  { 
    id: 'collaboration',
    title: '团队实时协作', 
    desc: '邀请导演与制片人实时评论，大幅缩短剧本审阅与定稿周期。', 
    icon: '👥',
    content: {
      sections: [
        { subtitle: '精准批注', body: '使用编辑器的批注功能。针对具体的行或段落提出意见，而不是笼统地说"这里感觉不对"。' },
        { subtitle: '角色权限划分', body: '明确制片、导演、编剧的修改权限。通常情况下，编剧负责主要逻辑，导演负责镜头感建议。' }
      ],
      tips: ['保持反馈的即时性', '尊重创作原意，以逻辑说服对方', '建立团队共同的剧本审美标准']
    }
  }
];

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery();
  const navigate = useNavigate();
  const tutorialModal = useModal();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
            欢迎回来, <br className="sm:hidden" />{user?.username} !
          </h1>
          <p className="text-indigo-100 max-w-md text-sm md:text-base font-medium opacity-90">
            开始你的专业创作之旅，今天又有什么精彩的创意？
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/script/new')}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black shadow-sm hover:bg-indigo-50 transition-all active:scale-95 text-sm md:text-base flex-1 sm:flex-none text-center"
            >
              新建剧本
            </button>
            <button 
              onClick={tutorialModal.open}
              className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-xl font-black backdrop-blur-sm hover:bg-white/20 transition-all active:scale-95 text-sm md:text-base flex-1 sm:flex-none text-center"
            >
              创作指南
            </button>
          </div>
        </div>
        <div className="absolute top-[-10%] right-[-5%] w-48 md:w-80 h-48 md:h-80 bg-white/10 rounded-full blur-[60px] md:blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[10%] w-40 md:w-64 h-40 md:h-64 bg-indigo-400/20 rounded-full blur-[50px] md:blur-[80px]"></div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsLoading ? (
          [...Array(4)].map((_, i) => <StatCard key={i} label="" value="" isLoading />)
        ) : (
          stats?.map((stat, idx) => (
            <StatCard
              key={idx}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              type={stat.type}
            />
          ))
        )}
      </div>

      <section className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">最近项目</h3>
          <button onClick={() => navigate('/project')} className="text-indigo-600 font-black text-xs md:text-sm hover:underline flex items-center gap-1">
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

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
              {projectsLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-6 h-12 bg-slate-50 rounded-lg"></td>
                  </tr>
                ))
              ) : (
                projects?.slice(0, 5).map((project) => (
                  <ProjectTableRow
                    key={project.id}
                    project={project}
                    onEdit={() => {}}
                    onClick={() => navigate(`/script/${project.id}`)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {projectsLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse"></div>
            ))
          ) : (
            projects?.slice(0, 5).map((project) => (
              <ProjectMobileCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/script/${project.id}`)}
              />
            ))
          )}
        </div>
      </section>

      <TutorialModal
        isOpen={tutorialModal.isOpen}
        onClose={tutorialModal.close}
        tutorials={TUTORIALS}
      />
    </div>
  );
};

export default Dashboard;
