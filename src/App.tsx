import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProjectProvider } from '@/contexts/ProjectContext';

// Modular Pages
const DashboardPage = React.lazy(() => import('./views/dashboard/DashboardPage'));
const ExplorerPage = React.lazy(() => import('./views/explorer/ExplorerPage'));
const PluginsPage = React.lazy(() => import('./views/plugins/PluginsPage'));
const CommunityPage = React.lazy(() => import('./views/community/CommunityPage'));

const Loading = () => (
  <div className="h-full w-full flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-r-2 border-transparent" />
  </div>
);

function App() {
  return (
    <ProjectProvider>
      <HashRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="explorer" element={<ExplorerPage />} />
              <Route path="plugins" element={<PluginsPage />} />
              <Route path="community" element={<CommunityPage />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ProjectProvider>
  );
}

export default App;