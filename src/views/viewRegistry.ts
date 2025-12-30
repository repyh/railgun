import React from 'react';
import { LayoutTemplate, Files, Package, Zap, type LucideIcon } from 'lucide-react';

export interface ViewModule {
    id: string;
    label: string;
    icon: LucideIcon;
    component: React.ComponentType;
    sidebar?: React.ComponentType;
    path: string;
    hidden?: boolean;
}

const DashboardPage = React.lazy(() => import('./dashboard/DashboardPage'));
const ExplorerPage = React.lazy(() => import('./explorer/ExplorerPage'));
const PluginsPage = React.lazy(() => import('./plugins/PluginsPage'));
const ProjectView = React.lazy(() => import('./ProjectView'));

export const VIEW_REGISTRY: ViewModule[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutTemplate,
        component: DashboardPage,
        path: '/'
    },
    {
        id: 'explorer',
        label: 'Explorer',
        icon: Files,
        component: ExplorerPage,
        path: '/explorer'
    },
    {
        id: 'plugins',
        label: 'Plugins',
        icon: Package,
        component: PluginsPage,
        path: '/plugins'
    },
    {
        id: 'project',
        label: 'Node Editor',
        icon: Zap,
        component: ProjectView,
        path: '/project'
    }
];
