
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProjectMutation } from '@/store/slices/apiSlice';

const NewScript: React.FC = () => {
  const navigate = useNavigate();
  const [createProject] = useCreateProjectMutation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    genre: '都市悬疑',
    description: '',
    tone: ''
  });

  const genres = [
    { name: '都市悬疑', icon: '🌃' },
    { name: '古装奇幻', icon: '⚔️' },
    { name: '职场逆袭', icon: '💼' },
    { name: '甜蜜治愈', icon: '💖' },
    { name: '赛博朋克', icon: '🤖' },
    { name: '社会派推理', icon: '🕵️' }
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setLoading(true);
    try {
      const result = await createProject({
        title: formData.title,
        description: formData.description,
        status: 'planning'
      }).unwrap();
      
      navigate(`/script/${result.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">创作实验室</h2>
          <p className="text-slate-500 font-medium">开启一个新的创作篇章</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 pl-1">剧本标题</label>
            <input 
              type="text" 
              required
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="请输入一个响亮的标题..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 pl-1">题材类别</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {genres.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => setFormData({...formData, genre: g.name})}
                  className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all ${
                    formData.genre === g.name 
                      ? 'border-indigo-600 bg-indigo-50/50' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-3xl mb-2">{g.icon}</span>
                  <span className={`text-sm font-bold ${formData.genre === g.name ? 'text-indigo-600' : 'text-slate-600'}`}>{g.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 pl-1">故事简介</label>
            <textarea 
              className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl h-40 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700"
              placeholder="概括一下这个剧本的核心卖点、反转或主要剧情..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-10 py-4 bg-white text-slate-500 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            取消
          </button>
          <button 
            type="submit"
            disabled={loading || !formData.title}
            className={`px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all ${
              loading || !formData.title ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {loading ? '正在创建...' : '立即开启创作'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewScript;
