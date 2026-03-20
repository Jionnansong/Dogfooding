
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProjectByIdQuery, useUpdateProjectMutation } from '@/store/slices/apiSlice';
import { Character } from '@/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { consumeTokens } from '@/store/slices/authSlice';
import { ChevronLeft, Zap, ShieldAlert, Rocket, Plus, Trash2, Edit3, Users, FileText, History } from 'lucide-react';

type EditorSection = 'content' | 'script_dialogue' | 'script_action' | 'script_camera';

const ScriptEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { data: project, isLoading, isError } = useGetProjectByIdQuery(id || '');
  const [updateProject] = useUpdateProjectMutation();

  // State to hold local edits for all sections
  const [localScripts, setLocalScripts] = useState<Record<EditorSection, string>>({
    content: '',
    script_dialogue: '',
    script_action: '',
    script_camera: ''
  });

  const [activeSection, setActiveSection] = useState<EditorSection>('content');
  const [activeTab, setActiveTab] = useState<'editor' | 'characters' | 'history'>('editor');
  
  // Track saved length per section to calculate token usage correctly
  const lastSavedLengthsRef = useRef<Record<EditorSection, number>>({
    content: 0,
    script_dialogue: 0,
    script_action: 0,
    script_camera: 0
  });

  // Track if we have initialized from project data to avoid overwriting user input
  const initializedRef = useRef(false);
  
  const [showCharModal, setShowCharModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [newChar, setNewChar] = useState({ name: '', role: '' });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (project && !initializedRef.current) {
      setLocalScripts({
        content: project.content || '',
        script_dialogue: project.script_dialogue || '',
        script_action: project.script_action || '',
        script_camera: project.script_camera || ''
      });
      lastSavedLengthsRef.current = {
        content: (project.content || '').length,
        script_dialogue: (project.script_dialogue || '').length,
        script_action: (project.script_action || '').length,
        script_camera: (project.script_camera || '').length
      };
      initializedRef.current = true;
    }
  }, [project]);

  useEffect(() => {
    if (user && user.tokenQuota.used >= user.tokenQuota.total) {
      setShowQuotaModal(true);
    }
  }, [user?.tokenQuota.used, user?.tokenQuota.total]);

  const saveContent = useCallback(async (section: EditorSection, newContent: string) => {
    if (!id || !project || !user) return;
    
    const currentLength = newContent.length;
    const previousLength = lastSavedLengthsRef.current[section];
    const diff = Math.max(0, currentLength - previousLength);
    
    if (user.tokenQuota.used + diff > user.tokenQuota.total) {
      setShowQuotaModal(true);
      return;
    }

    setIsSaving(true);
    try {
      await updateProject({ id, changes: { [section]: newContent } }).unwrap();
      if (diff > 0) {
        dispatch(consumeTokens(diff));
      }
      // Update baseline for this section
      lastSavedLengthsRef.current[section] = currentLength;
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [id, project, updateProject, user, dispatch]);

  // Handle switching sections
  const handleSectionChange = (newSection: EditorSection) => {
    // Check if current section needs saving before switch
    const currentText = localScripts[activeSection];
    const savedText = project?.[activeSection] || '';
    
    // Only trigger immediate save if local is different from server (and assumes local is newer)
    // Note: In a real collaborative app, this logic would be more complex.
    if (currentText !== savedText) {
      saveContent(activeSection, currentText);
    }
    setActiveSection(newSection);
  };

  // Debounced auto-save for the active section
  useEffect(() => {
    const currentText = localScripts[activeSection];
    const savedText = project?.[activeSection] || '';

    const timer = setTimeout(() => {
      if (currentText !== savedText && project) {
        saveContent(activeSection, currentText);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [localScripts, activeSection, project, saveContent]);

  const handleAddCharacter = async () => {
    if (!newChar.name || !id || !project) return;
    const char: Character = {
      id: `c_${Date.now()}`,
      name: newChar.name,
      role: newChar.role
    };
    const updatedChars = [...(project.characters || []), char];
    try {
      await updateProject({ id, changes: { characters: updatedChars } }).unwrap();
      setShowCharModal(false);
      setNewChar({ name: '', role: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCharacter = async (charId: string) => {
    if (!id || !project) return;
    const updatedChars = (project.characters || []).filter(c => c.id !== charId);
    await updateProject({ id, changes: { characters: updatedChars } }).unwrap();
  };

  const getPlaceholder = (section: EditorSection) => {
    if (isReadOnly) return "配额已耗尽，请升级后继续创作...";
    switch(section) {
      case 'script_dialogue': return "输入角色对白... (例如：张三：你好！)";
      case 'script_action': return "输入动作描述... (例如：他猛地站起身，碰翻了咖啡杯)";
      case 'script_camera': return "输入镜头语言... (例如：特写，推镜头，画面逐渐变暗)";
      default: return "开始书写你的精彩剧本...";
    }
  };

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black text-sm uppercase tracking-widest">初始化编辑器...</p>
      </div>
    </div>
  );

  if (isError || !project) return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6">
      <div className="text-6xl mb-6">😿</div>
      <h3 className="text-xl font-black text-slate-800">项目丢失或无权访问</h3>
      <p className="text-slate-400 mt-2 mb-8 font-medium">该项目可能已被删除，或由于网络原因暂时无法加载。</p>
      <button onClick={() => navigate('/project')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100">返回项目中心</button>
    </div>
  );

  const isReadOnly = user && user.tokenQuota.used >= user.tokenQuota.total;
  const currentContent = localScripts[activeSection];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] gap-4 md:gap-6 animate-in fade-in zoom-in-95 duration-500 relative">
      {/* Editor Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/project')} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg md:text-2xl font-black text-slate-800 truncate tracking-tight">{project.title}</h2>
            {isReadOnly && (
              <span className="flex items-center gap-1 text-rose-500 text-[9px] font-black uppercase tracking-widest animate-pulse mt-0.5">
                <ShieldAlert className="w-3 h-3" /> 只读模式
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4 px-1 md:px-0">
           {isSaving ? (
             <span className="text-[10px] text-indigo-500 font-black animate-pulse flex items-center gap-1.5 uppercase">
               <Zap className="w-3 h-3 fill-current" />
               正在云端同步
             </span>
           ) : (
             <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">最后保存: {project.updatedAt}</span>
           )}
           <span className="text-[10px] text-slate-400 font-mono font-black bg-slate-100 px-2 py-0.5 rounded uppercase">字数: {currentContent.length}</span>
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div className="md:hidden flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
        <button 
          onClick={() => setActiveTab('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'editor' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400'}`}
        >
          <FileText className="w-4 h-4" /> 编辑
        </button>
        <button 
          onClick={() => setActiveTab('characters')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'characters' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400'}`}
        >
          <Users className="w-4 h-4" /> 角色
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400'}`}
        >
          <History className="w-4 h-4" /> 版本
        </button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden relative">
        {/* Editor Main */}
        <div className={`flex-1 bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden relative transition-opacity ${isReadOnly ? 'opacity-80' : ''} ${activeTab !== 'editor' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 md:p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div className="flex items-center gap-4">
              <select 
                disabled={isReadOnly}
                className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 cursor-pointer"
                value={activeSection}
                onChange={(e) => handleSectionChange(e.target.value as EditorSection)}
              >
                <option value="content">正文文本</option>
                <option value="script_dialogue">角色对白</option>
                <option value="script_action">动作描述</option>
                <option value="script_camera">镜头语言</option>
              </select>
            </div>
            {isReadOnly && (
              <button 
                onClick={() => setShowQuotaModal(true)}
                className="text-[10px] md:text-xs font-black text-indigo-600 hover:underline uppercase tracking-widest"
              >
                升级扩容
              </button>
            )}
          </div>
          <textarea 
            readOnly={isReadOnly}
            className="flex-1 p-6 md:p-10 font-mono text-base md:text-lg leading-relaxed text-slate-700 focus:outline-none resize-none bg-transparent custom-scrollbar disabled:cursor-not-allowed"
            value={currentContent}
            onChange={(e) => {
              const newVal = e.target.value;
              setLocalScripts(prev => ({ ...prev, [activeSection]: newVal }));
            }}
            placeholder={getPlaceholder(activeSection)}
          />
        </div>

        {/* Sidebar Utilities - Desktop & Tabbed Mobile Views */}
        <div className={`w-full md:w-80 space-y-6 flex-col ${activeTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
          {/* Characters Section */}
          <div className={`bg-white p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden ${activeTab === 'history' ? 'hidden md:flex' : 'flex'}`}>
            <h4 className="font-black text-slate-800 mb-5 flex items-center justify-between text-sm md:text-base">
              <span>登场角色</span>
              <span className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded text-indigo-600 font-black uppercase tracking-widest">{project.characters?.length || 0}</span>
            </h4>
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {project.characters?.map((char) => (
                <div key={char.id} className="group flex items-center gap-3 p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg md:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm border border-indigo-100/50 uppercase shrink-0">
                    {char.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{char.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter truncate font-bold">{char.role || '设定待完善'}</p>
                  </div>
                  {!isReadOnly && (
                    <button 
                      onClick={() => handleRemoveCharacter(char.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <button 
                  onClick={() => setShowCharModal(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-100 text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl md:rounded-2xl hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> 添加新角色
                </button>
              )}
            </div>
          </div>

          {/* Version History */}
          <div className={`bg-white p-6 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 ${activeTab === 'characters' ? 'hidden md:block' : 'block'}`}>
            <h4 className="font-black text-slate-800 mb-4 text-sm md:text-base">版本历史</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-lg shadow-emerald-100"></div>
                <div>
                  <p className="text-[10px] md:text-xs font-black text-slate-700">当前版本 (V1.2)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">{project.updatedAt} 系统保存</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Modal - High z-index global backdrop */}
      {showQuotaModal && (
        <div className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-amber-500"></div>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
              <Zap className="w-8 h-8 md:w-10 md:h-10 fill-current" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 tracking-tight">Token 额度已耗尽</h3>
            <p className="text-slate-400 mb-8 leading-relaxed font-bold text-sm md:text-base">
              当前版本额度已满 (<span className="text-slate-800">{user?.tokenQuota.total}</span> tokens)。请升级套餐以解锁更广阔的创作空间。
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <Rocket className="w-5 h-5" /> 立即升级套餐
              </button>
              <button 
                onClick={() => setShowQuotaModal(false)}
                className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
              >
                稍后再说
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Character Modal - Standardized global backdrop */}
      {showCharModal && (
        <div className="!m-0 fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg shadow-emerald-100 shrink-0">🎭</div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">新增角色</h3>
                <p className="text-slate-400 font-bold text-xs md:text-sm">为剧本注入鲜活生命力</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">角色姓名</label>
                <input 
                  type="text" 
                  placeholder="例如：苏明玉 / 老金"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
                  value={newChar.name}
                  onChange={e => setNewChar({...newChar, name: e.target.value})}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">角色定位</label>
                <input 
                  type="text" 
                  placeholder="例如：反派头目 / 寻找真相的少女"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
                  value={newChar.role}
                  onChange={e => setNewChar({...newChar, role: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-8 md:mt-10 flex gap-3">
              <button 
                onClick={() => setShowCharModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
              >
                取消
              </button>
              <button 
                onClick={handleAddCharacter}
                disabled={!newChar.name}
                className={`flex-[2] py-4 bg-emerald-500 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-emerald-100 transition-all text-sm ${
                  !newChar.name ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-600 active:scale-95'
                }`}
              >
                确定添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptEditor;
