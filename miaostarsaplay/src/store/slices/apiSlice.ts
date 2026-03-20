import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Project, DataMetric, Character, TeamMember, Brand } from '@/types';

interface PartialState {
  auth: {
    token: string | null;
  };
}

export interface AnalyticsResponse {
  performance: { name: string; views: number; likes: number; retention: number }[];
  summary: { label: string; value: string; change: string; type: 'up' | 'down'; color: string }[];
}

const DEFAULT_PROJECTS: Project[] = [
  { 
    id: '1', 
    title: '《星际猫咖》第一季', 
    description: '关于猫咪在宇宙开店的奇幻故事', 
    content: '【第一幕：场景 - 夜晚的赛博喵城】\n\n小黑：（看着闪烁的霓虹灯）在这座城市，九条命也不够花的。',
    script_dialogue: '小黑：在这座城市，九条命也不够花的。\n小白：这也是为什么我们要开这家店的原因。',
    script_action: '小黑缓缓抬起爪子，试图抓住全息投影中的鱼干。\n霓虹灯光在它黑色的毛发上反射出蓝紫色的光芒。',
    script_camera: '1. 远景：赛博城市的俯瞰镜头，推进到巷子。\n2. 特写：小黑的瞳孔收缩。\n3. 中景：猫咖的招牌亮起。',
    characters: [
      { id: 'c1', name: '小黑', role: '主角 / 侦探' }
    ],
    status: 'shooting', 
    updatedAt: '2023-10-25', 
    author: '喵酱' 
  },
  { id: '2', title: '《代码之恋》微电影', description: '程序员的爱情攻势', status: 'planning', updatedAt: '2023-10-24', author: '小派' },
  { id: '3', title: '《重返地球》短剧', description: '科幻灾难题材', status: 'post-production', updatedAt: '2023-10-20', author: '老李' },
];

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 'm1', name: '喵酱', email: 'miaojiang@miaostars.com', role: '导演', status: 'Active', joinDate: '2023-08-12', avatar: 'https://picsum.photos/40/40?random=10' },
  { id: 'm2', name: '小派', email: 'xiaopai@miaostars.com', role: '编剧', status: 'Active', joinDate: '2023-09-01', avatar: 'https://picsum.photos/40/40?random=11' },
  { id: 'm3', name: '老李', email: 'laoli@miaostars.com', role: '后期', status: 'Idle', joinDate: '2023-07-20', avatar: 'https://picsum.photos/40/40?random=12' },
];

const DEFAULT_BRANDS: Brand[] = [
  { id: 'b1', name: '喵星传媒', slogan: '用猫的视角看世界', logo: 'https://picsum.photos/100/100?random=20', primaryColor: '#6366f1', secondaryColor: '#818cf8', projectCount: 12, updatedAt: '2023-10-20' },
  { id: 'b2', name: '未来剧场', slogan: '触碰明日之光', logo: 'https://picsum.photos/100/100?random=21', primaryColor: '#0f172a', secondaryColor: '#334155', projectCount: 5, updatedAt: '2023-10-22' },
];

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/', 
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as PartialState;
      const token = state.auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Project', 'Script', 'User', 'Analytics', 'Team', 'Brand'],
  endpoints: (builder) => ({
    // Removed generic type arguments to fix "Untyped function calls may not accept type arguments" errors
    getDashboardStats: builder.query<DataMetric[], void>({
      async queryFn() {
        const data: DataMetric[] = [
          { label: '剧本总数', value: 128, change: 12, type: 'up' },
          { label: '本月产量', value: 45, change: 8, type: 'up' },
          { label: '活跃用户', value: 1204, change: 5, type: 'down' },
          { label: '转化率', value: 24.5, change: 2.1, type: 'up' },
        ];
        return { data };
      }
    }),
    getAnalyticsData: builder.query<AnalyticsResponse, string>({
      async queryFn(timeRange: string) {
        const isWeek = timeRange === 'week';
        const performance = isWeek ? [
          { name: '周一', views: 400, likes: 240, retention: 70 },
          { name: '周二', views: 300, likes: 139, retention: 65 },
          { name: '周三', views: 500, likes: 480, retention: 80 },
          { name: '周四', views: 278, likes: 390, retention: 72 },
          { name: '周五', views: 689, likes: 480, retention: 78 },
          { name: '周六', views: 939, likes: 580, retention: 85 },
          { name: '周日', views: 849, likes: 430, retention: 82 },
        ] : [
          { name: '10-01', views: 4000, likes: 2400, retention: 70 },
          { name: '10-05', views: 3000, likes: 1398, retention: 65 },
          { name: '10-10', views: 2000, likes: 9800, retention: 80 },
          { name: '10-15', views: 2780, likes: 3908, retention: 72 },
          { name: '10-20', views: 1890, likes: 4800, retention: 68 },
          { name: '10-25', views: 2390, likes: 3800, retention: 75 },
          { name: '10-30', views: 3490, likes: 4300, retention: 78 },
        ];
        const summary: AnalyticsResponse['summary'] = [
          { label: '总播放量', value: isWeek ? '124K' : '1.2M', change: isWeek ? '+5.4%' : '+12.5%', type: 'up', color: 'indigo' },
          { label: '活跃观众', value: isWeek ? '8.2K' : '45.8K', change: isWeek ? '+2.1%' : '+5.2%', type: 'up', color: 'emerald' },
          { label: '平均留存', value: isWeek ? '75%' : '72%', change: isWeek ? '+4.2%' : '+2.1%', type: 'up', color: 'amber' },
          { label: '作品分享', value: isWeek ? '1.1K' : '8.4K', change: isWeek ? '+0.5%' : '-1.4%', type: (isWeek ? 'up' : 'down') as 'up' | 'down', color: 'rose' },
        ];
        const data: AnalyticsResponse = { performance, summary };
        return { data };
      },
      providesTags: (result: any, error: any, timeRange: string) => [{ type: 'Analytics' as const, id: timeRange }]
    }),
    getTeamMembers: builder.query<TeamMember[], void>({
      async queryFn() {
        const saved = localStorage.getItem('mock_team');
        const data: TeamMember[] = saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
        return { data };
      },
      providesTags: ['Team']
    }),
    inviteMember: builder.mutation<TeamMember, Partial<TeamMember>>({
      async queryFn(newMember: Partial<TeamMember>) {
        const saved = localStorage.getItem('mock_team');
        const current = saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
        const member: TeamMember = {
          id: String(Date.now()),
          name: newMember.name || '新成员',
          email: newMember.email || '',
          role: newMember.role || '编剧',
          status: 'Pending',
          joinDate: new Date().toISOString().split('T')[0],
          avatar: `https://picsum.photos/40/40?random=${Math.floor(Math.random() * 100)}`,
        };
        const updated = [...current, member];
        localStorage.setItem('mock_team', JSON.stringify(updated));
        return { data: member };
      },
      invalidatesTags: ['Team']
    }),
    updateMember: builder.mutation<TeamMember, { id: string; changes: Partial<TeamMember> }>({
      async queryFn({ id, changes }: { id: string; changes: Partial<TeamMember> }) {
        const saved = localStorage.getItem('mock_team');
        const current: TeamMember[] = saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
        const updated = current.map(m => m.id === id ? { ...m, ...changes } : m);
        localStorage.setItem('mock_team', JSON.stringify(updated));
        const data = updated.find(m => m.id === id)!;
        return { data };
      },
      invalidatesTags: ['Team']
    }),
    removeMember: builder.mutation<void, string>({
      async queryFn(id: string) {
        const saved = localStorage.getItem('mock_team');
        const current: TeamMember[] = saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
        const updated = current.filter(m => m.id !== id);
        localStorage.setItem('mock_team', JSON.stringify(updated));
        return { data: undefined };
      },
      invalidatesTags: ['Team']
    }),
    getBrands: builder.query<Brand[], void>({
      async queryFn() {
        const saved = localStorage.getItem('mock_brands');
        const data: Brand[] = saved ? JSON.parse(saved) : DEFAULT_BRANDS;
        return { data };
      },
      providesTags: ['Brand']
    }),
    createBrand: builder.mutation<Brand, Partial<Brand>>({
      async queryFn(newBrand: Partial<Brand>) {
        const saved = localStorage.getItem('mock_brands');
        const current = saved ? JSON.parse(saved) : DEFAULT_BRANDS;
        const brand: Brand = {
          id: String(Date.now()),
          name: newBrand.name || '新品牌',
          slogan: newBrand.slogan || '',
          logo: newBrand.logo || `https://picsum.photos/100/100?random=${Math.floor(Math.random()*100)}`,
          primaryColor: newBrand.primaryColor || '#6366f1',
          secondaryColor: newBrand.secondaryColor || '#818cf8',
          projectCount: 0,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        const updated = [...current, brand];
        localStorage.setItem('mock_brands', JSON.stringify(updated));
        return { data: brand };
      },
      invalidatesTags: ['Brand']
    }),
    updateBrand: builder.mutation<Brand, { id: string; changes: Partial<Brand> }>({
      async queryFn({ id, changes }: { id: string; changes: Partial<Brand> }) {
        const saved = localStorage.getItem('mock_brands');
        const current: Brand[] = saved ? JSON.parse(saved) : DEFAULT_BRANDS;
        const updated = current.map(b => b.id === id ? { ...b, ...changes, updatedAt: new Date().toISOString().split('T')[0] } : b);
        localStorage.setItem('mock_brands', JSON.stringify(updated));
        const data = updated.find(b => b.id === id)!;
        return { data };
      },
      invalidatesTags: ['Brand']
    }),
    deleteBrand: builder.mutation<void, string>({
      async queryFn(id: string) {
        const saved = localStorage.getItem('mock_brands');
        const current: Brand[] = saved ? JSON.parse(saved) : DEFAULT_BRANDS;
        const updated = current.filter(b => b.id !== id);
        localStorage.setItem('mock_brands', JSON.stringify(updated));
        return { data: undefined };
      },
      invalidatesTags: ['Brand']
    }),
    getProjects: builder.query<Project[], void>({
      async queryFn() {
        const saved = localStorage.getItem('mock_projects');
        const data: Project[] = saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
        return { data };
      },
      providesTags: ['Project']
    }),
    getProjectById: builder.query<Project, string>({
      async queryFn(id: string) {
        const saved = localStorage.getItem('mock_projects');
        const current: Project[] = saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
        const project = current.find(p => p.id === id);
        if (!project) return { error: { status: 404, data: 'Project not found' } as any };
        return { data: project };
      },
      providesTags: (result: any, error: any, id: string) => [{ type: 'Project' as const, id }]
    }),
    createProject: builder.mutation<Project, Partial<Project>>({
      async queryFn(newProject: Partial<Project>) {
        const saved = localStorage.getItem('mock_projects');
        const current = saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
        const project: Project = {
          id: String(Date.now()),
          title: newProject.title || '未命名项目',
          description: newProject.description || '',
          content: newProject.content || '',
          characters: newProject.characters || [],
          status: newProject.status || 'planning',
          updatedAt: new Date().toISOString().split('T')[0],
          author: newProject.author || '当前用户',
        };
        const updated = [project, ...current];
        localStorage.setItem('mock_projects', JSON.stringify(updated));
        return { data: project };
      },
      invalidatesTags: ['Project']
    }),
    updateProject: builder.mutation<Project, { id: string; changes: Partial<Project> }>({
      async queryFn({ id, changes }: { id: string; changes: Partial<Project> }) {
        const saved = localStorage.getItem('mock_projects');
        const current: Project[] = saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
        const updated = current.map(p => p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString().split('T')[0] } : p);
        localStorage.setItem('mock_projects', JSON.stringify(updated));
        const updatedProject = updated.find(p => p.id === id);
        return { data: updatedProject! };
      },
      invalidatesTags: (result: any, error: any, { id }: any) => ['Project', { type: 'Project' as const, id }]
    }),
    deleteProject: builder.mutation<void, string>({
      async queryFn(id: string) {
        const saved = localStorage.getItem('mock_projects');
        const current: Project[] = saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
        const updated = current.filter(p => p.id !== id);
        localStorage.setItem('mock_projects', JSON.stringify(updated));
        return { data: undefined };
      },
      invalidatesTags: ['Project']
    })
  }),
});

export const { 
  useGetDashboardStatsQuery, 
  useGetAnalyticsDataQuery,
  useGetTeamMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetProjectsQuery, 
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation
} = apiSlice;