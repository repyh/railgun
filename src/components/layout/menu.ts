import {
    Save,
    FolderOpen,
    Plus,
    Undo,
    Redo,
    Scissors,
    Copy,
    ClipboardCopy as ClipboardIcon,
    RefreshCw,
    Terminal,
    Monitor,
    Layout,
    HelpCircle,
    Github,
    Info
} from 'lucide-react';

export type ActionType = 'ipc' | 'modal' | 'event' | 'link' | 'nav';

export interface MenuAction {
    type: ActionType;
    target: string;
    args?: any[];
}

export interface MenuItem {
    label?: string;
    icon?: any;
    shortcut?: string;
    action?: MenuAction;
    divider?: boolean;
    disabled?: boolean;
}

export const MENU_CONFIG: Record<string, MenuItem[]> = {
    file: [
        { label: 'New Project', icon: Plus, shortcut: 'Ctrl+N', action: { type: 'modal', target: 'create-project' } },
        { label: 'Open Project', icon: FolderOpen, shortcut: 'Ctrl+O', action: { type: 'ipc', target: 'project:openProject' } },
        { divider: true },
        { label: 'Save', icon: Save, shortcut: 'Ctrl+S', action: { type: 'event', target: 'railgun:save' } },
        { label: 'Save All', shortcut: 'Ctrl+Shift+S', action: { type: 'event', target: 'railgun:save-all' } },
        { divider: true },
        { label: 'Settings', action: { type: 'nav', target: '/settings' } },
        { divider: true },
        { label: 'Exit', action: { type: 'ipc', target: 'titlebar:closeWindow' } }
    ],
    edit: [
        { label: 'Undo', icon: Undo, shortcut: 'Ctrl+Z', action: { type: 'event', target: 'railgun:undo' } },
        { label: 'Redo', icon: Redo, shortcut: 'Ctrl+Y', action: { type: 'event', target: 'railgun:redo' } },
    ],
    plugins: [
        { label: 'Reload Plugins', icon: RefreshCw, shortcut: 'Ctrl+R', action: { type: 'event', target: 'railgun:reload-plugins' } },
        { label: 'Developer Tools', icon: Terminal, action: { type: 'ipc', target: 'system:openDevTools' } }
    ],
    view: [
        { label: 'Toggle Activity Bar', icon: Layout, action: { type: 'event', target: 'railgun:toggle-activity-bar' } },
        { label: 'Toggle Console', icon: Terminal, action: { type: 'modal', target: 'toggle-console' } }
    ],
    help: [
        // { label: 'Documentation', icon: HelpCircle, action: { type: 'link', target: 'https://docs.railgun.dev' } },
        { label: 'GitHub Repository', icon: Github, action: { type: 'link', target: 'https://github.com/railgun-discord/railgun' } },
        { divider: true },
        { label: 'About Railgun', icon: Info, action: { type: 'link', target: 'https://railgun.repyh.com/' } }
    ]
};
