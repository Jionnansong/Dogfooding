
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Icons, VERSION_COLORS } from '@/constants';
import { UserVersion } from '@/types';
import { useGetProjectsQuery } from '@/store/slices/apiSlice';
import { Menu, X, ChevronRight, LogOut, Zap, Activity } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: projects } = useGetProjectsQuery(undefined);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const firstProjectId = projects?.[0]?.id;
  const defaultScriptPath = firstProjectId ? `/script/${firstProjectId}` : '/script/new';

  const menuItems = [
    { name: '工作台', path: '/dashboard', icon: <Icons.Dashboard />, rootPath: '/dashboard' },
    { name: '项目管理', path: '/project', icon: <Icons.Project />, rootPath: '/project' },
    { name: '脚本编辑器', path: defaultScriptPath, icon: <Icons.Script />, rootPath: '/script' },
    { name: '数据看板', path: '/data', icon: <Icons.Data />, rootPath: '/data' },
    { name: '团队管理', path: '/team', icon: <Icons.Team />, rootPath: '/team' },
  ];

  if (user?.version === UserVersion.ENTERPRISE) {
    menuItems.push({ name: '品牌管理', path: '/brand', icon: <Icons.Brand />, rootPath: '/brand' });
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const used = user?.tokenQuota.used || 0;
  const total = user?.tokenQuota.total || 1;
  const quotaPercent = Math.min(100, (used / total) * 100);
  const isLowQuota = quotaPercent > 90;

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 shrink-0">M</div>
          {(isSidebarOpen || mobile) && <span className="font-bold text-xl text-slate-800 tracking-tight">Miaostars</span>}
        </div>
        {mobile && (
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.rootPath);
          return (
            <Link
              key={item.rootPath}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {item.icon}
              </span>
              {(isSidebarOpen || mobile) && <span className="font-bold text-sm tracking-wide whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {mobile && (
        <div className="p-6 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3 mb-6">
            <img src={user?.avatar} className="w-10 h-10 rounded-xl" alt="Avatar" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black">{user?.version}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm"
          >
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex ${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex-col h-full shadow-sm z-30 shrink-0`}
      >
        <SidebarContent />
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
          >
            {isSidebarOpen ? (
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                <ChevronRight className="w-4 h-4 rotate-180" />
                收起导航
              </div>
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)}>
        <aside
          className={`absolute top-0 left-0 w-72 h-full bg-white shadow-2xl transition-transform duration-300 transform flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent mobile />
        </aside>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between z-40 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight truncate max-w-[120px] md:max-w-none">
              {menuItems.find(i => location.pathname.startsWith(i.rootPath))?.name || '工作台'}
            </h2>
            <div className="hidden lg:flex items-center gap-2 ml-4 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-in fade-in zoom-in duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">系统就绪</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex flex-col items-end">
              <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] ${isLowQuota ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                {isLowQuota ? '余额不足' : '配额'}
              </span>
              <div className="flex items-center gap-2 md:gap-3 mt-0.5">
                <div className="w-16 sm:w-24 md:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isLowQuota ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
                <span className={`text-[10px] md:text-[11px] font-mono font-black ${isLowQuota ? 'text-rose-600' : 'text-slate-600'}`}>
                  {Math.floor(used / 1000)}k/{Math.floor(total / 1000)}k
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:pl-6 md:border-l md:border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-tight">{user?.username}</p>
                <button onClick={handleLogout} className="text-[10px] text-rose-500 hover:text-rose-600 font-black uppercase tracking-widest mt-0.5">Logout</button>
              </div>
              <div className="relative group cursor-pointer" onClick={() => navigate('/dashboard')}>
                <img
                  src={user?.avatar}
                  alt="Avatar"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl border-2 border-slate-100 ring-2 md:ring-4 ring-white shadow-sm transition-transform group-hover:scale-105"
                />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
