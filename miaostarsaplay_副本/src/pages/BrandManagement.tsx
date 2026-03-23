
import React, { useState } from 'react';
import { 
  useGetBrandsQuery, 
  useCreateBrandMutation, 
  useUpdateBrandMutation, 
  useDeleteBrandMutation 
} from '@/store/slices/apiSlice';
import { Brand } from '@/types';
import { Loader2, Plus, X, Layout, Settings, Trash2, Palette, Globe, Layers, AlertTriangle } from 'lucide-react';

const BrandManagement: React.FC = () => {
  const { data: brands, isLoading } = useGetBrandsQuery();
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    primaryColor: '#6366f1',
    secondaryColor: '#818cf8',
    logo: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({ name: '', slogan: '', primaryColor: '#6366f1', secondaryColor: '#818cf8', logo: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ 
      name: brand.name, 
      slogan: brand.slogan, 
      primaryColor: brand.primaryColor, 
      secondaryColor: brand.secondaryColor,
      logo: brand.logo
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsSubmitting(true);
    try {
      if (editingBrand) {
        await updateBrand({ id: editingBrand.id, changes: formData }).unwrap();
      } else {
        await createBrand(formData).unwrap();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteBrand(brandToDelete.id).unwrap();
      setIsDeleteModalOpen(false);
      setBrandToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header - Optimized for Mobile Stacking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">品牌管理</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm md:text-base">建立与维护企业视觉标识及内容矩阵</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="px-6 py-3.5 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap">创建新品牌</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {brands?.map((brand) => (
            <div key={brand.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 group flex flex-col sm:flex-row gap-6 md:gap-8 relative overflow-hidden">
               {/* Color Bar Decoration */}
               <div className="absolute top-0 left-0 bottom-0 w-2" style={{ backgroundColor: brand.primaryColor }} />
               
               <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-start gap-4">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-slate-50 border border-slate-100 p-2 md:p-4 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                     <img src={brand.logo} className="w-full h-full object-contain mix-blend-multiply" alt={brand.name} />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-lg shadow-sm border border-white" style={{ backgroundColor: brand.primaryColor }} title="主色" />
                    <div className="w-6 h-6 rounded-lg shadow-sm border border-white" style={{ backgroundColor: brand.secondaryColor }} title="副色" />
                  </div>
               </div>

               <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight truncate">{brand.name}</h3>
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(brand)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Settings className="w-5 h-5" /></button>
                      <button onClick={() => { setBrandToDelete(brand); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <p className="text-slate-400 font-medium mb-4 md:mb-6 italic text-sm md:text-base">“{brand.slogan}”</p>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3">
                       <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                       <div className="min-w-0">
                         <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">关联项目</p>
                         <p className="text-base md:text-lg font-bold text-slate-700 truncate">{brand.projectCount}</p>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3">
                       <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                       <div className="min-w-0">
                         <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">规格</p>
                         <p className="text-base md:text-lg font-bold text-slate-700 truncate">ENT</p>
                       </div>
                    </div>
                  </div>
                  
                  <p className="mt-4 md:mt-6 text-[9px] md:text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">更新: {brand.updatedAt}</p>
               </div>
            </div>
          ))}

          {/* Empty State Placeholder */}
          <div 
            onClick={handleOpenCreate}
            className="bg-white p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:bg-slate-50 transition-all cursor-pointer group min-h-[180px]"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <p className="font-black text-base md:text-lg">新增品牌资产</p>
          </div>
        </div>
      )}

      {/* Brand Modal - Updated with global dark backdrop */}
      {isModalOpen && (
        <div className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg shrink-0">
                  <Palette className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-800">{editingBrand ? '编辑品牌' : '创建品牌'}</h3>
                  <p className="hidden sm:block text-slate-500 text-sm">统一视觉语言，提升专业度</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">品牌名称</label>
                  <input 
                    type="text" 
                    required
                    placeholder="例如：喵星剧场" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-slate-500 outline-none transition-all font-bold text-slate-700 text-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">品牌 Slogan</label>
                  <input 
                    type="text" 
                    placeholder="简单一句话概括" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-slate-500 outline-none transition-all font-medium text-slate-700 text-sm"
                    value={formData.slogan}
                    onChange={e => setFormData({...formData, slogan: e.target.value})}
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">品牌主色</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl cursor-pointer border-none bg-transparent shrink-0"
                      value={formData.primaryColor}
                      onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                    />
                    <input 
                      type="text"
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono font-bold uppercase"
                      value={formData.primaryColor}
                      onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">辅助色彩</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-xl cursor-pointer border-none bg-transparent shrink-0"
                      value={formData.secondaryColor}
                      onChange={e => setFormData({...formData, secondaryColor: e.target.value})}
                    />
                    <input 
                      type="text"
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono font-bold uppercase"
                      value={formData.secondaryColor}
                      onChange={e => setFormData({...formData, secondaryColor: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">Logo 地址</label>
                   <div className="flex gap-4">
                     <div className="w-12 h-12 md:w-16 md:h-16 shrink-0 bg-slate-50 rounded-xl md:rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {formData.logo ? <img src={formData.logo} className="w-full h-full object-contain" alt="" /> : <Layout className="w-6 h-6 text-slate-200" />}
                     </div>
                     <input 
                      type="text" 
                      placeholder="https://example.com/logo.png" 
                      className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-slate-500 outline-none transition-all font-medium text-slate-700 text-sm"
                      value={formData.logo}
                      onChange={e => setFormData({...formData, logo: e.target.value})}
                    />
                   </div>
                </div>
              </div>

              <div className="pt-6 md:pt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-[2] py-4 bg-slate-900 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-slate-100 transition-all flex items-center justify-center gap-2 text-sm ${
                    isSubmitting ? 'opacity-50' : 'hover:bg-slate-800 active:scale-95'
                  }`}
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingBrand ? '保存变更' : '立即创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - High z-index global dark backdrop */}
      {isDeleteModalOpen && brandToDelete && (
        <div className="!m-0 fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shrink-0 shadow-inner">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">删除品牌资产</h3>
            <p className="text-slate-500 mb-8 leading-relaxed font-bold text-sm md:text-base">
              您确定要删除品牌 <span className="text-slate-800 underline decoration-rose-200">"{brandToDelete.name}"</span> 吗？
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
              >
                保留资产
              </button>
              <button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className={`flex-1 py-4 bg-rose-500 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-2 text-sm ${
                  isSubmitting ? 'opacity-50' : 'hover:bg-rose-600 active:scale-95'
                }`}
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandManagement;
