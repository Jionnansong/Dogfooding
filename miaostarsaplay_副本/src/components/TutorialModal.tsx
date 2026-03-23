import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Zap, ChevronRight, ArrowLeft } from 'lucide-react';
import Modal, { ModalHeader, ModalContent } from './ui/Modal';

interface TutorialContent {
  sections: { subtitle: string; body: string }[];
  tips: string[];
}

export interface TutorialItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  content: TutorialContent;
}

export const TUTORIALS: TutorialItem[] = [
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

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialItem | null>(null);

  const handleClose = () => {
    setSelectedTutorial(null);
    onClose();
  };

  const handleBack = () => {
    setSelectedTutorial(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full">
      <ModalHeader
        title={selectedTutorial ? selectedTutorial.title : '创作学院'}
        subtitle={selectedTutorial ? '深度掌握核心创作要领' : '掌握从剧本到成片的核心流程'}
        icon={selectedTutorial ? undefined : '🎓'}
        onBack={selectedTutorial ? handleBack : undefined}
        onClose={handleClose}
      />
      <ModalContent>
        {!selectedTutorial ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {TUTORIALS.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedTutorial(item)}
                className="group p-6 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
              >
                <div className="text-3xl md:text-4xl mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">
                  {item.icon}
                </div>
                <h4 className="text-lg md:text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-slate-500 text-xs md:text-base leading-relaxed font-medium flex-1">
                  {item.desc}
                </p>
                <div className="mt-6 flex items-center gap-2 text-indigo-500 font-black text-xs md:text-sm transform group-hover:translate-x-1 transition-transform">
                  <span>开始学习</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10 md:space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
            <div className="relative p-6 md:p-10 bg-indigo-600 rounded-[2rem] md:rounded-[3rem] text-white overflow-hidden shadow-xl shadow-indigo-100">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 opacity-70" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Lesson Overview</span>
                </div>
                <h4 className="text-2xl md:text-4xl font-black mb-4 tracking-tight leading-tight">
                  {selectedTutorial.title}
                </h4>
                <p className="text-indigo-100 font-medium leading-relaxed md:text-lg max-w-2xl">
                  {selectedTutorial.desc}
                </p>
              </div>
              <div className="absolute top-[-20%] right-[-10%] text-[15rem] md:text-[20rem] opacity-[0.05] pointer-events-none rotate-12 select-none">
                {selectedTutorial.icon}
              </div>
            </div>

            <div className="grid gap-8 md:gap-12">
              {selectedTutorial.content.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm md:text-base shrink-0 shadow-lg">
                      0{idx + 1}
                    </span>
                    <h5 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                      {section.subtitle}
                    </h5>
                  </div>
                  <p className="pl-12 md:pl-14 text-slate-600 text-base md:text-lg leading-loose font-medium">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

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
                  <div
                    key={idx}
                    className="flex items-start gap-3 md:gap-4 bg-white/50 p-4 md:p-5 rounded-2xl border border-emerald-200 shadow-sm backdrop-blur-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-emerald-900 font-bold text-sm md:text-base">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-8 md:pt-12">
              <button
                onClick={handleBack}
                className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all text-base"
              >
                已学完，查看其他课程
              </button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TutorialModal;
