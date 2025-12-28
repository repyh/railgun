import { HashRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardView } from '@/views/DashboardView';
import { ProjectView } from '@/views/ProjectView';

import { ProjectProvider } from '@/contexts/ProjectContext';

function App() {
  return (
    <ProjectProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardView />} />
            <Route path="project" element={<ProjectView />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProjectProvider>
  );
}

export default App;