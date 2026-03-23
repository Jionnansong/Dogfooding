
# MiaostarsAPlay (喵星智剧) 前端项目

喵星智剧是一个企业级短剧生产与管理平台，旨在为创作团队提供从剧本策划、团队协作到品牌矩阵管理的全链路数字化解决方案。

## 🚀 启动指南

#### 前台运行（查看实时日志）
```bash
# 1. 确保 Docker Desktop 已启动
# 2. 在项目根目录执行
docker compose up --build

# 3. 等待容器启动完成
# 4. 浏览器访问 http://localhost:3000
```

## 🛠 技术栈

本项目基于现代前端企业级标准构建：

- **Frontend**: Vite 7 + React 19 + TypeScript
- **状态管理**: Redux Toolkit (RTK) + RTK Query (数据缓存与同步)
- **路由管理**: React Router Dom 7 (支持动态路由与懒加载)
- **网络请求**: Axios (封装拦截器，支持 Token 校验与错误处理)
- **UI 组件库**: Tailwind CSS + Lucide React (图标) + Recharts (数据可视化)
- **代码规范**: ESLint + Prettier
- **容器化**: Docker + Nginx

## 📁 工程目录结构

```text
miaostarsaplay---喵星智剧/
├── src/                     # 📂 源代码目录
│   ├── components/          # 🧩 通用组件
│   │   ├── AuthGuard.tsx   # 路由权限守卫
│   │   └── Layout/         # 布局组件
│   │       └── index.tsx   # 主布局 (侧边栏+顶栏)
│   │
│   ├── pages/              # 📄 业务页面
│   │   ├── Login.tsx       # 登录页
│   │   ├── Dashboard.tsx   # 工作台
│   │   ├── Projects.tsx    # 项目中心
│   │   ├── NewScript.tsx   # 新建剧本
│   │   ├── ScriptEditor.tsx # 剧本编辑器
│   │   ├── DataBoard.tsx   # 数据看板
│   │   ├── TeamManagement.tsx # 团队管理
│   │   └── BrandManagement.tsx # 品牌矩阵
│   │
│   ├── store/              # 🗄️ 状态管理
│   │   ├── index.ts        # Store 配置
│   │   └── slices/         # Redux Slices
│   │       ├── authSlice.ts # 认证状态
│   │       └── apiSlice.ts # RTK Query API
│   │
│   ├── utils/              # 🔧 工具函数
│   │   ├── request.ts      # Axios 封装
│   │   └── request.test.ts # 请求测试
│   │
│   ├── types.ts            # 📘 全局类型定义
│   ├── constants.tsx       # 📌 全局常量
│   ├── App.tsx             # 🎯 应用根组件
│   └── main.tsx            # 🚀 应用入口
│
├── index.html              # 📝 HTML 模板
├── docker-compose.yml      # 🐳 Docker 编排
├── Dockerfile              # 🐳 Docker 镜像构建
├── nginx.conf              # ⚙️ Nginx 配置
├── vite.config.ts          # ⚡️ Vite 配置
├── tsconfig.json           # 🔷 TypeScript 配置
├── .eslintrc.js            # 📏 ESLint 配置
├── package.json            # 📦 依赖配置
└── README.md               # 📖 项目说明
```

## 🎨 核心功能特性

### 1️⃣ 工作台 (Dashboard)
实时概览项目进度、创作额度及核心业务指标，集成互动式创作教程。

### 2️⃣ 项目中心 (Project Management)
全生命周期管理创作项目，支持快速检索、状态流转及增删改查。

### 3️⃣ 智能编辑器 (Script Editor)
- **多维创作**: 支持正文、角色对白、动作描述、镜头语言四种模式切换
- **沉浸体验**: 实时字数统计、云端自动同步、Token 额度监控
- **角色管理**: 快捷添加与管理剧本角色

### 4️⃣ 数据看板 (Analytics)
多维数据洞察，支持周/月度及自定义日期的播放量、留存率、互动率趋势分析。

### 5️⃣ 团队协作 (Team)
基于角色的成员管理、状态监控与邀请机制。

### 6️⃣ 品牌矩阵 (Brand)
（企业版）统一管理多个子品牌的视觉标识、配色方案与内容资产。

## 📱 响应式适配

### PC 端
- 采用固定侧边栏布局，确保导航在长内容页面下始终可见
- 大屏下展示丰富的数据表格与图表

### 移动端
- 响应式侧边栏转为抽屉式导航
- 复杂的表格自动转换为卡片流展示
- 剧本编辑器采用 Tab 切换模式（编辑/角色/历史），优化小屏操作空间
- 数据看板图表自动适配屏幕宽度

## 🐳 Docker 配置说明

### 镜像构建策略
采用 **多阶段构建 (Multi-Stage Build)** 模式：

1. **构建阶段**: 使用 `node:24-alpine` 编译 TypeScript 和打包资源
2. **运行阶段**: 使用 `nginx:alpine` 提供静态文件服务

### Nginx 配置特性
- ✅ SPA 路由支持 (React Router)
- ✅ 静态资源缓存优化 (30天缓存)
- ✅ API 反向代理配置
- ✅ 监听端口: 3000

## 📝 开发日志

详细的开发记录和技术决策请查看 [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)

## 🧪 测试账号

- **Basic Edition**: 输入任意创作花名
- **Pro Edition**: 输入任意创作花名
- **Enterprise Edition**: 输入任意创作花名

---

**© 2026 MiaostarsAPlay | 喵星智剧 - 企业级短剧生产与管理平台**
