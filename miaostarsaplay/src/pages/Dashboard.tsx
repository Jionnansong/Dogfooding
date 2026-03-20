
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetDashboardStatsQuery, useGetProjectsQuery } from '@/store/slices/apiSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
// Added Zap to the imports from lucide-react
import { ChevronRight, Clock, User as UserIcon, X, ArrowLeft, BookOpen, Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface TutorialItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  content: {
    sections: { subtitle: string; body: string }[];
    tips: string[];
  };
}

const TUTORIALS: TutorialItem[] = [
  { 
    id: 'quick-start',
    title: '快速启动剧本', 
    desc: '如何从剧本大纲开始构建第一幕场景，梳理核心戏剧冲突点。', 
    icon: '⚡',
    content: {
      sections: [
        { subtitle: '黄金3秒原则', body: '短剧的第一镜必须具备强视觉冲击力或悬念。避免冗长的背景铺垫，直接将主角置入危机或巨大反差中。' },
        { subtitle: '钩子设置', body: '每一集结束时必须留有“钩子”。例如：身份暴露的瞬间、致命误会的产生或突如其来的危机。' }
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
        { subtitle: '版本命名规范', body: '建议采用“日期_状态_负责人”的命名方式。例如：231025_初稿_喵酱。避免使用“最终版1”、“绝对不改版”等模糊词汇。' },
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
        { subtitle: '精准批注', body: '使用编辑器的批注功能。针对具体的行或段落提出意见，而不是笼统地说“这里感觉不对”。' },
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
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialItem | null>(null);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    setSelectedTutorial(null);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight tracking-tight">欢迎回来, <br className="sm:hidden" />{user?.username} !</h1>
          <p className="text-indigo-100 max-w-md text-sm md:text-base font-medium opacity-90">开始你的专业创作之旅，今天又有什么精彩的创意？</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/script/new')}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black shadow-sm hover:bg-indigo-50 transition-all active:scale-95 text-sm md:text-base flex-1 sm:flex-none text-center"
            >
              新建剧本
            </button>
            <button 
              onClick={() => setShowTutorial(true)}
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
        {statsLoading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-28 md:h-32 bg-white rounded-2xl animate-pulse shadow-sm border border-slate-100"></div>)
        ) : (
          stats?.map((stat, idx) => (
            <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all duration-300">
              <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest truncate">{stat.label}</p>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-2 gap-1">
                <span className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">{stat.value}</span>
                <span className={`text-[10px] md:text-xs font-black flex items-center gap-0.5 ${stat.type === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.type === 'up' ? '↑' : '↓'} {stat.change}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Projects Section */}
      <section className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">最近项目</h3>
          <button onClick={() => navigate('/project')} className="text-indigo-600 font-black text-xs md:text-sm hover:underline flex items-center gap-1">
            查看全部 <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table View (Desktop Only) */}
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
                [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="py-6 h-12 bg-slate-50 rounded-lg"></td></tr>)
              ) : (
                projects?.slice(0, 5).map((project) => (
                  <tr key={project.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/script/${project.id}`)}>
                    <td className="py-6 font-bold text-slate-700">{project.title}</td>
                    <td className="py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        project.status === 'shooting' ? 'bg-amber-100 text-amber-600' :
                        project.status === 'planning' ? 'bg-slate-100 text-slate-500' :
                        project.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {project.status === 'shooting' ? '拍摄中' : project.status === 'planning' ? '策划中' : project.status === 'completed' ? '已完成' : '后期中'}
                      </span>
                    </td>
                    <td className="py-6 text-slate-400 text-xs font-mono">{project.updatedAt}</td>
                    <td className="py-6 text-slate-500 text-xs font-bold">{project.author}</td>
                    <td className="py-6 text-right pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-5 h-5 text-indigo-400 ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* List View (Mobile Only) */}
        <div className="md:hidden space-y-4">
          {projectsLoading ? (
             [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse"></div>)
          ) : (
            projects?.slice(0, 5).map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/script/${project.id}`)}
                className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 active:bg-slate-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 line-clamp-1 flex-1">{project.title}</h4>
                  <span className={`shrink-0 ml-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    project.status === 'shooting' ? 'bg-amber-100 text-amber-600' :
                    project.status === 'planning' ? 'bg-slate-100 text-slate-500' :
                    project.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {project.status === 'shooting' ? '拍摄' : project.status === 'planning' ? '策划' : project.status === 'completed' ? '完成' : '后期'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.updatedAt}</span>
                  <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {project.author}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Tutorial Modal - Updated for interactive learning */}
      {showTutorial && (
        <div className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full h-full md:w-[90%] md:h-[85%] md:max-w-6xl md:rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="px-6 py-8 md:px-12 md:pt-12 md:pb-8 flex justify-between items-start sticky top-0 bg-white z-20 border-b border-slate-50 md:border-none">
              <div className="flex items-center gap-4 md:gap-6">
                {selectedTutorial ? (
                  <button 
                    onClick={() => setSelectedTutorial(null)}
                    className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0 active:scale-90"
                  >
                    <ArrowLeft className="w-6 h-6 md:w-7 md:h-7" />
                  </button>
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl md:text-3xl shadow-inner shadow-indigo-200/20 shrink-0">🎓</div>
                )}
                <div>
                  <h3 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">
                    {selectedTutorial ? selectedTutorial.title : '创作学院'}
                  </h3>
                  <p className="text-slate-400 font-bold text-xs md:text-lg">
                    {selectedTutorial ? '深度掌握核心创作要领' : '掌握从剧本到成片的核心流程'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCloseTutorial}
                className="p-2 md:p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-800 active:scale-90"
              >
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

            {/* Modal Content Wrapper */}
            <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:pb-16 custom-scrollbar relative">
              
              {!selectedTutorial ? (
                /* Tutorial List View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {TUTORIALS.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedTutorial(item)}
                      className="group p-6 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                      <div className="text-3xl md:text-4xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">{item.icon}</div>
                      <h4 className="text-lg md:text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                      <p className="text-slate-500 text-xs md:text-base leading-relaxed font-medium flex-1">{item.desc}</p>
                      <div className="mt-6 flex items-center gap-2 text-indigo-500 font-black text-xs md:text-sm transform group-hover:translate-x-1 transition-transform">
                        <span>开始学习</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Tutorial Detail View */
                <div className="max-w-4xl mx-auto space-y-10 md:space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
                   {/* Introduction */}
                   <div className="relative p-6 md:p-10 bg-indigo-600 rounded-[2rem] md:rounded-[3rem] text-white overflow-hidden shadow-xl shadow-indigo-100">
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <BookOpen className="w-5 h-5 opacity-70" />
                           <span className="text-xs font-black uppercase tracking-[0.2em]">Lesson Overview</span>
                        </div>
                        <h4 className="text-2xl md:text-4xl font-black mb-4 tracking-tight leading-tight">{selectedTutorial.title}</h4>
                        <p className="text-indigo-100 font-medium leading-relaxed md:text-lg max-w-2xl">{selectedTutorial.desc}</p>
                      </div>
                      <div className="absolute top-[-20%] right-[-10%] text-[15rem] md:text-[20rem] opacity-[0.05] pointer-events-none rotate-12 select-none">
                        {selectedTutorial.icon}
                      </div>
                   </div>

                   {/* Main Content Sections */}
                   <div className="grid gap-8 md:gap-12">
                      {selectedTutorial.content.sections.map((section, idx) => (
                        <div key={idx} className="space-y-4">
                           <div className="flex items-center gap-4">
                              <span className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm md:text-base shrink-0 shadow-lg">0{idx + 1}</span>
                              <h5 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{section.subtitle}</h5>
                           </div>
                           <p className="pl-12 md:pl-14 text-slate-600 text-base md:text-lg leading-loose font-medium">
                              {section.body}
                           </p>
                        </div>
                      ))}
                   </div>

                   {/* Expert Tips Card */}
                   <div className="p-8 md:p-12 bg-emerald-50 rounded-[2rem] md:rounded-[3rem] border border-emerald-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 md:p-12 text-emerald-100 opacity-50 group-hover:scale-110 transition-transform duration-700">
                         <Sparkles className="w-20 h-20 md:w-32 md:h-32" />
                      </div>
                      <h5 className="text-emerald-800 font-black text-xl md:text-2xl mb-8 flex items-center gap-3 relative z-10">
                         <Zap className="w-6 h-6 fill-current" />
                         创作避坑指南
                      </h5>
                      <div className="space-y-4 relative z-10">
                        {selectedTutorial.content.tips.map((tip, idx) => (
                          <div key={idx} className="flex items-start gap-3 md:gap-4 bg-white/50 p-4 md:p-5 rounded-2xl border border-emerald-200 shadow-sm backdrop-blur-sm">
                             <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 shrink-0 mt-0.5" />
                             <p className="text-emerald-900 font-bold text-sm md:text-base">{tip}</p>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Completion Footer */}
                   <div className="text-center pt-8 md:pt-12">
                      <button 
                        onClick={() => setSelectedTutorial(null)}
                        className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all text-base"
                      >
                        已学完，查看其他课程
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
