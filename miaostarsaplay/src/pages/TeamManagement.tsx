
import React, { useState, useEffect } from 'react';
import { 
  useGetTeamMembersQuery, 
  useInviteMemberMutation, 
  useUpdateMemberMutation, 
  useRemoveMemberMutation 
} from '@/store/slices/apiSlice';
import { TeamMember } from '@/types';
import { Loader2, Plus, X, UserPlus, Settings, Trash2, Mail, Check, AlertCircle, ChevronRight, Calendar } from 'lucide-react';

const TeamManagement: React.FC = () => {
  const { data: members, isLoading } = useGetTeamMembersQuery();
  const [inviteMember] = useInviteMemberMutation();
  const [updateMember] = useUpdateMemberMutation();
  const [removeMember] = useRemoveMemberMutation();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<TeamMember['role']>('编剧');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: '编剧' as TeamMember['role'] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles: TeamMember['role'][] = ['导演', '编剧', '制片人', '后期', '组长'];

  useEffect(() => {
    if (selectedMember) {
      setEditName(selectedMember.name);
      setEditRole(selectedMember.role);
    }
  }, [selectedMember]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.name) return;
    setIsSubmitting(true);
    try {
      await inviteMember(inviteForm).unwrap();
      setIsInviteOpen(false);
      setInviteForm({ name: '', email: '', role: '编剧' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedMember || !editName) return;
    setIsUpdating(true);
    try {
      await updateMember({ 
        id: selectedMember.id, 
        changes: { name: editName, role: editRole } 
      }).unwrap();
      setIsManageOpen(false);
      setSelectedMember(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedMember) return;
    const nextStatus: TeamMember['status'] = selectedMember.status === 'Active' ? 'Idle' : 'Active';
    try {
      await updateMember({ id: selectedMember.id, changes: { status: nextStatus } }).unwrap();
      setSelectedMember({ ...selectedMember, status: nextStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const triggerRemoveConfirm = () => {
    setIsManageOpen(false);
    setIsRemoveConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedMember) return;
    setIsDeleting(true);
    try {
      await removeMember(selectedMember.id).unwrap();
      setIsRemoveConfirmOpen(false);
      setSelectedMember(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">团队管理</h2>
          <p className="text-slate-400 font-bold mt-1 text-sm md:text-base">管理成员权限与项目协作效率</p>
        </div>
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="px-6 py-3.5 md:py-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <UserPlus className="w-5 h-5" />
          邀请新成员
        </button>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 min-h-[400px]">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">成员信息</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">协作角色</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">当前状态</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">加入日期</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {members?.map((member) => (
                    <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                             <img src={member.avatar} className="w-12 h-12 rounded-2xl shadow-sm ring-2 ring-white" alt={member.name} />
                             <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                               member.status === 'Active' ? 'bg-emerald-500' : member.status === 'Idle' ? 'bg-amber-400' : 'bg-slate-300'
                             }`} />
                          </div>
                          <div>
                            <p className="font-black text-slate-800">{member.name}</p>
                            <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-wider">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          member.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                          member.status === 'Idle' ? 'bg-amber-100 text-amber-600' : 
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {member.status === 'Active' ? '在线' : member.status === 'Idle' ? '闲置' : '邀请中'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-slate-400 font-mono font-bold tracking-tight">{member.joinDate}</td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => { setSelectedMember(member); setIsManageOpen(true); }}
                          className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-50">
              {members?.map((member) => (
                <div key={member.id} className="p-5 flex items-center gap-4 active:bg-slate-50 transition-colors cursor-pointer" onClick={() => { setSelectedMember(member); setIsManageOpen(true); }}>
                  <div className="relative shrink-0">
                    <img src={member.avatar} className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm" alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      member.status === 'Active' ? 'bg-emerald-500' : member.status === 'Idle' ? 'bg-amber-400' : 'bg-slate-300'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-black text-slate-800 tracking-tight">{member.name}</p>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest">{member.role}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{member.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-wider"><Calendar className="w-3 h-3" /> {member.joinDate}</span>
                       <span className={`text-[9px] font-black uppercase tracking-widest ${
                         member.status === 'Active' ? 'text-emerald-500' : member.status === 'Idle' ? 'text-amber-500' : 'text-slate-400'
                       }`}>
                         ● {member.status === 'Active' ? '在线' : member.status === 'Idle' ? '闲置' : '离线'}
                       </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Invite Modal - Standardized global dark backdrop */}
      {isInviteOpen && (
        <div className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg shadow-indigo-100 shrink-0">
                  <UserPlus className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">邀请同伴</h3>
                  <p className="text-slate-400 font-bold text-xs md:text-sm truncate">协同创作，共建内容矩阵</p>
                </div>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">花名</label>
                <input 
                  type="text" 
                  required
                  placeholder="请输入成员称呼" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
                  value={inviteForm.name}
                  onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">邮箱地址</label>
                <input 
                  type="email" 
                  required
                  placeholder="member@miaostars.com" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
                  value={inviteForm.email}
                  onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">协作角色</label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {roles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setInviteForm({...inviteForm, role})}
                      className={`px-3 py-2.5 rounded-xl text-[10px] md:text-xs font-black border-2 transition-all tracking-tight ${
                        inviteForm.role === role ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-[2] py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 text-sm ${
                    isSubmitting ? 'opacity-50' : 'hover:bg-indigo-700 active:scale-95'
                  }`}
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  发送邀请
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage/Edit Modal - Standardized global dark backdrop */}
      {isManageOpen && selectedMember && (
        <div className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">成员设置</h3>
              <button onClick={() => setIsManageOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-slate-50/50 p-6 rounded-2xl md:rounded-[2rem] border border-slate-100">
              <div className="relative shrink-0">
                <img src={selectedMember.avatar} className="w-20 h-20 rounded-[1.5rem] shadow-xl ring-4 ring-white" alt="" />
                <button 
                  onClick={handleToggleStatus}
                  className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border-2 border-white shadow-lg transition-all ${
                    selectedMember.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <input 
                  type="text"
                  className="text-xl font-black text-slate-800 bg-transparent border-b-2 border-transparent focus:border-indigo-500 focus:outline-none w-full transition-all text-center sm:text-left tracking-tight"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="成员名称"
                />
                <p className="text-slate-400 font-bold text-xs mt-1 truncate">{selectedMember.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 pl-1">职位调整</label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {roles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setEditRole(role)}
                      className={`px-3 py-2.5 rounded-xl text-[10px] md:text-xs font-black border-2 transition-all tracking-tight ${
                        editRole === role ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={handleUpdateMember}
                  disabled={isUpdating || !editName}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  {isUpdating && <Loader2 className="w-5 h-5 animate-spin" />}
                  保存设置
                </button>
                
                <div className="flex gap-3">
                   <button 
                    onClick={handleToggleStatus}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    {selectedMember.status === 'Active' ? '设为离线' : '设为在线'}
                  </button>
                  <button 
                    onClick={triggerRemoveConfirm}
                    className="flex-1 py-4 bg-rose-50 text-rose-600 font-black rounded-xl md:rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    移除成员
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal - High z-index global dark backdrop */}
      {isRemoveConfirmOpen && selectedMember && (
        <div className="!m-0 fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2">确认移除</h3>
            <p className="text-slate-400 mb-8 leading-relaxed font-bold text-sm md:text-base">
              您确定要将 <span className="text-slate-800 underline decoration-rose-200">"{selectedMember.name}"</span> 从团队中移除吗？
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => { setIsRemoveConfirmOpen(false); setIsManageOpen(true); }}
                className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-xl md:rounded-2xl hover:bg-slate-200 transition-all text-sm"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmRemove}
                disabled={isDeleting}
                className={`flex-1 py-4 bg-rose-500 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-2 text-sm ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-600 active:scale-95'
                }`}
              >
                {isDeleting && <Loader2 className="w-5 h-5 animate-spin" />}
                确定移除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
