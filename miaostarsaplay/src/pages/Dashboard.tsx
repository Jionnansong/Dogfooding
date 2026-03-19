import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { StatCard } from '@/components/ui';
import Card from '@/components/ui/Card';
import ProjectList from '@/components/ProjectList';
import TutorialModal from '@/components/TutorialModal';
import { useDashboardData, useModal } from '@/hooks';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, stats, projects, statsLoading, projectsLoading } = useDashboardData();
  const tutorialModal = useModal();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
            欢迎回来, <br className="sm:hidden" />
            {user?.username}!
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsLoading
          ? [...Array(4)].map((_, i) => <StatCard key={i} label="" value="" loading />)
          : stats?.map((stat, idx) => (
              <StatCard
                key={idx}
                label={stat.label}
                value={stat.value}
                change={stat.change}
                type={stat.type}
              />
            ))}
      </div>

      {/* Recent Projects Section */}
      <Card padding="lg" rounded="2xl">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">最近项目</h3>
          <button
            onClick={() => navigate('/project')}
            className="text-indigo-600 font-black text-xs md:text-sm hover:underline flex items-center gap-1"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <ProjectList projects={projects || []} loading={projectsLoading} />
      </Card>

      {/* Tutorial Modal */}
      <TutorialModal isOpen={tutorialModal.isOpen} onClose={tutorialModal.close} />
    </div>
  );
};

export default Dashboard;
