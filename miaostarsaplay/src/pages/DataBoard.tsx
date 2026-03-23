
import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { TrendingUp, Users, Play, Share2, Calendar as CalendarIcon, Loader2, X, Check, ArrowRight } from 'lucide-react';
import { useGetAnalyticsDataQuery } from '@/store/slices/apiSlice';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-xl border border-slate-100 rounded-2xl">
        <p className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">{label}</p>
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
            <p className="text-sm font-bold text-slate-700">
              {item.name === 'views' ? '播放量' : item.name === 'likes' ? '点赞数' : '留存率'}: 
              <span className="ml-1 text-indigo-600">{item.value.toLocaleString()}{item.name === 'retention' ? '%' : ''}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DataBoard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDates, setTempDates] = useState({ start: '', end: '' });
  const [displayRange, setDisplayRange] = useState('10-01 至 10-31');

  const { data, isLoading, isFetching } = useGetAnalyticsDataQuery(timeRange);

  const getIcon = (label: string) => {
    switch (label) {
      case '总播放量': return <Play className="w-5 h-5" />;
      case '活跃观众': return <Users className="w-5 h-5" />;
      case '平均留存': return <TrendingUp className="w-5 h-5" />;
      case '作品分享': return <Share2 className="w-5 h-5" />;
      default: return <Play className="w-5 h-5" />;
    }
  };

  const handleApplyCustomRange = () => {
    if (tempDates.start && tempDates.end) {
      const customKey = `custom_${tempDates.start}_${tempDates.end}`;
      setTimeRange(customKey);
      setDisplayRange(`${tempDates.start} 至 ${tempDates.end}`);
      setIsCalendarOpen(false);
    }
  };

  const setPresetRange = (range: string) => {
    setTimeRange(range);
    setDisplayRange(range === 'week' ? '本周数据概览' : '10-01 至 10-31');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">数据看板</h2>
          <p className="text-slate-500 font-medium mt-1">作品多维表现深度洞察 ({displayRange})</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm relative">
          {isFetching && (
            <div className="absolute -top-6 right-0 flex items-center gap-2 text-[10px] font-bold text-indigo-500 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              正在同步最新数据...
            </div>
          )}
          <button 
            onClick={() => setPresetRange('week')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeRange === 'week' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            本周
          </button>
          <button 
            onClick={() => setPresetRange('month')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${timeRange === 'month' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            本月
          </button>
          <div className="w-px h-6 bg-slate-100 mx-1"></div>
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className={`p-2 transition-colors rounded-lg ${timeRange.startsWith('custom') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
          ))
        ) : data?.summary.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 overflow-hidden relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${
              stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
              stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
              stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
              'bg-rose-50 text-rose-600'
            }`}>
              {getIcon(stat.label)}
            </div>
            <p className="text-slate-400 text-sm font-bold mb-1 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</span>
              <span className={`text-xs font-bold mb-1.5 ${stat.type === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change}
              </span>
            </div>
            
            {/* Background decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] rotate-12 group-hover:scale-125 transition-transform duration-700 ${
               stat.color === 'indigo' ? 'text-indigo-600' :
               stat.color === 'emerald' ? 'text-emerald-600' :
               stat.color === 'amber' ? 'text-amber-600' :
               'text-rose-600'
            }`}>
              {getIcon(stat.label)}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[3rem] transition-all">
              <div className="flex flex-col items-center gap-3">
                 <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                 <p className="text-xs font-bold text-slate-400">更新图表中...</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-800">播放趋势分析</h3>
              <p className="text-sm text-slate-400 mt-1">播放量与互动数据的综合走势</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-xs font-bold text-slate-500">播放量</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-500">互动数</span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.performance || []}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  animationDuration={1500}
                />
                <Area 
                  type="monotone" 
                  dataKey="likes" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorLikes)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Retention Chart */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col relative">
          <div className="mb-10">
            <h3 className="text-xl font-bold text-slate-800">用户留存分析</h3>
            <p className="text-sm text-slate-400 mt-1">关键节点的完播留存比例</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.performance || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="stepAfter" 
                  dataKey="retention" 
                  stroke="#f59e0b" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700">整体完播率</span>
                <span className="text-sm font-black text-indigo-600">
                  {timeRange === 'week' ? '75.2%' : '72.4%'}
                </span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                  style={{ width: timeRange === 'week' ? '75.2%' : '72.4%' }}
                ></div>
              </div>
            </div>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700">跳出峰值点</span>
                <span className="text-sm font-black text-rose-500">01:24</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">用户通常在第一幕转场处流失较多，建议加强节奏把控。</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Range Selection Modal */}
      {isCalendarOpen && (
        <div className="!m-0 fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md p-6 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">自定义时间段</h3>
                  <p className="text-slate-400 font-bold text-xs">选择需要分析的项目周期</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCalendarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">开始日期</label>
                  <input 
                    type="date"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
                    value={tempDates.start}
                    onChange={(e) => setTempDates({ ...tempDates, start: e.target.value })}
                  />
                </div>
                <div className="hidden sm:flex items-center mt-6 text-slate-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-1">结束日期</label>
                  <input 
                    type="date"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-700 text-sm"
                    value={tempDates.end}
                    onChange={(e) => setTempDates({ ...tempDates, end: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setIsCalendarOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all text-sm"
                >
                  取消
                </button>
                <button 
                  onClick={handleApplyCustomRange}
                  disabled={!tempDates.start || !tempDates.end}
                  className={`flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 text-sm ${
                    !tempDates.start || !tempDates.end ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 active:scale-95'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  应用并刷新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataBoard;
