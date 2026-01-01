import { LayoutTemplate, Files, Search, GitGraph, Settings, Package, type LucideIcon } from 'lucide-react';
import type { MenuAction } from './menu';

export interface SidebarItem {
    id: string;
    label: string;
    icon: LucideIcon;
    path?: string;
    action?: MenuAction;
    position: 'top' | 'bottom';
}

export const SIDEBAR_CONFIG: SidebarItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutTemplate,
        path: '/',
        position: 'top'
    },
    {
        id: 'explorer',
        label: 'Explorer',
        icon: Files,
        path: '/explorer',
        position: 'top'
    },
    {
        id: 'plugins',
        label: 'Plugins',
        icon: Package,
        path: '/plugins',
        position: 'top'
    },
    {
        id: 'search',
        label: 'Search',
        icon: Search,
        position: 'top'
    },
    {
        id: 'git',
        label: 'Source Control',
        icon: GitGraph,
        position: 'top'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: '/settings',
        position: 'bottom'
    }
];
