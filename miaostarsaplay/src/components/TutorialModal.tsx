import React from 'react';
import { ArrowLeft, BookOpen, Sparkles, CheckCircle2, Zap, ChevronRight, X } from 'lucide-react';

export interface TutorialItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  content: {
    sections: { subtitle: string; body: string }[];
    tips: string[];
  };
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorials: TutorialItem[];
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  tutorials
}) => {
  const [selectedTutorial, setSelectedTutorial] = React.useState<TutorialItem | null>(null);

  const handleClose = () => {
    setSelectedTutorial(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full h-full md:w-[90%] md:h-[85%] md:max-w-6xl md:rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col overflow-hidden relative">
        
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
            onClick={handleClose}
            className="p-2 md:p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-800 active:scale-90"
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:pb-16 custom-scrollbar relative">
          
          {!selectedTutorial ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {tutorials.map((item) => (
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
            <div className="max-w-4xl mx-auto space-y-10 md:space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
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
  );
};
