
import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import MainLayout from './components/Layout';
import AuthGuard from './components/AuthGuard';

// Lazy loading components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Projects = React.lazy(() => import('./pages/Projects'));
const ScriptEditor = React.lazy(() => import('./pages/ScriptEditor'));
const NewScript = React.lazy(() => import('./pages/NewScript'));
const DataBoard = React.lazy(() => import('./pages/DataBoard'));
const TeamManagement = React.lazy(() => import('./pages/TeamManagement'));
const BrandManagement = React.lazy(() => import('./pages/BrandManagement'));
const Login = React.lazy(() => import('./pages/Login'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      <p className="text-slate-500 font-medium animate-pulse">喵星智剧 载入中...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AuthGuard><MainLayout /></AuthGuard>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="project" element={<Projects />} />
              <Route path="script/new" element={<NewScript />} />
              <Route path="script/:id" element={<ScriptEditor />} />
              <Route path="data" element={<DataBoard />} />
              <Route path="team" element={<TeamManagement />} />
              <Route path="brand" element={<BrandManagement />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </Provider>
  );
};

export default App;
