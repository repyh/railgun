import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

// Modular Pages
const DashboardPage = React.lazy(() => import('./views/dashboard/DashboardPage'));
const ExplorerPage = React.lazy(() => import('./views/explorer/ExplorerPage'));
const PluginsPage = React.lazy(() => import('./views/plugins/PluginsPage'));
const CommunityPage = React.lazy(() => import('./views/community/CommunityPage'));
const SettingsPage = React.lazy(() => import('./views/settings/SettingsPage'));
const FlowEditor = React.lazy(() => import('@/components/editor/FlowEditor'));

const Loading = () => (
  <div className="h-full w-full flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-800 border-t-blue-500" />
  </div>
);

function App() {
  return (
    <ProjectProvider>
      <SettingsProvider>
        <HashRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="explorer" element={<ExplorerPage />} />
                <Route path="plugins" element={<PluginsPage />} />
                <Route path="community" element={<CommunityPage />} />
                <Route path="flow" element={<FlowEditor />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </HashRouter>
      </SettingsProvider>
    </ProjectProvider>
  );
}

export default App;