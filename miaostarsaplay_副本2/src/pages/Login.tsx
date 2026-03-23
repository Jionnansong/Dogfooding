
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials } from '@/store/slices/authSlice';
import { UserVersion } from '@/types';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (version: UserVersion) => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      dispatch(setCredentials({
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: '1',
          username: username || '创作导师',
          avatar: 'https://picsum.photos/200/200?random=1',
          version: version,
          tokenQuota: {
            used: 1250,
            total: version === UserVersion.ENTERPRISE ? 50000 : version === UserVersion.PRO ? 10000 : 2000
          }
        }
      }));
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-violet-100 rounded-full blur-[100px] opacity-60"></div>

      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100">M</div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">喵星智剧</h1>
          <p className="text-slate-400 mt-2 font-medium uppercase tracking-widest text-[10px]">Miaostars APlay Platform</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">用户名</label>
            <input 
              type="text" 
              placeholder="输入你的创作花名" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">选择版本进入</p>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => handleLogin(UserVersion.BASIC)}
                disabled={isLoading}
                className="group p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">基础版</h4>
                  <p className="text-xs text-slate-400">免费体验核心创作功能</p>
                </div>
                <span className="text-slate-300 group-hover:text-indigo-400">→</span>
              </button>
              
              <button 
                onClick={() => handleLogin(UserVersion.PRO)}
                disabled={isLoading}
                className="group p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">专业版</h4>
                  <p className="text-xs text-slate-400">支持批量剧本生成与团队协作</p>
                </div>
                <span className="text-slate-300 group-hover:text-indigo-400">→</span>
              </button>

              <button 
                onClick={() => handleLogin(UserVersion.ENTERPRISE)}
                disabled={isLoading}
                className="group p-4 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-2xl hover:from-indigo-900 hover:to-indigo-800 transition-all text-left flex items-center justify-between shadow-lg"
              >
                <div>
                  <h4 className="font-bold text-white">企业旗舰版</h4>
                  <p className="text-xs text-slate-400">品牌矩阵管理及专属定制服务</p>
                </div>
                <span className="text-slate-600 group-hover:text-indigo-400">✨</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 flex items-center justify-center gap-3 text-indigo-600 font-bold">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            正在同步数据...
          </div>
        )}

        {/* <p className="mt-10 text-center text-slate-400 text-xs font-medium">
          登录即代表同意 <a href="#" className="text-indigo-500 hover:underline">服务协议</a> 与 <a href="#" className="text-indigo-500 hover:underline">隐私条款</a>
        </p> */}
      </div>
    </div>
  );
};

export default Login;
