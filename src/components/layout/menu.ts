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

export type ActionType = 'ipc' | 'modal' | 'command' | 'link';

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
        { label: 'Save', icon: Save, shortcut: 'Ctrl+S', action: { type: 'command', target: 'save-project' } },
        { label: 'Save All', shortcut: 'Ctrl+Shift+S', action: { type: 'command', target: 'save-all' } },
        { divider: true },
        { label: 'Settings', action: { type: 'command', target: 'settings' } },
        { divider: true },
        { label: 'Exit', action: { type: 'ipc', target: 'titlebar:closeWindow' } }
    ],
    edit: [
        { label: 'Undo', icon: Undo, shortcut: 'Ctrl+Z', action: { type: 'command', target: 'undo' } },
        { label: 'Redo', icon: Redo, shortcut: 'Ctrl+Y', action: { type: 'command', target: 'redo' } },
        { divider: true },
        { label: 'Cut', icon: Scissors, shortcut: 'Ctrl+X', action: { type: 'command', target: 'cut' } },
        { label: 'Copy', icon: Copy, shortcut: 'Ctrl+C', action: { type: 'command', target: 'copy' } },
        { label: 'Paste', icon: ClipboardIcon, shortcut: 'Ctrl+V', action: { type: 'command', target: 'paste' } }
    ],
    plugins: [
        { label: 'Reload Plugins', icon: RefreshCw, shortcut: 'Ctrl+R', action: { type: 'command', target: 'reload-plugins' } },
        { label: 'Developer Tools', icon: Terminal, action: { type: 'ipc', target: 'system:openDevTools' } }
    ],
    view: [
        { label: 'Toggle Activity Bar', icon: Layout, action: { type: 'command', target: 'toggle-activity-bar' } },
        { label: 'Toggle Console', icon: Terminal, action: { type: 'modal', target: 'toggle-console' } },
        { divider: true },
        { label: 'Appearance', icon: Monitor, action: { type: 'modal', target: 'settings-appearance' } }
    ],
    help: [
        { label: 'Documentation', icon: HelpCircle, action: { type: 'link', target: 'https://docs.railgun.dev' } },
        { label: 'GitHub Repository', icon: Github, action: { type: 'link', target: 'https://github.com/railgun-discord/railgun' } },
        { divider: true },
        { label: 'About Railgun', icon: Info, action: { type: 'link', target: 'https://railgun.repyh.com/' } }
    ]
};
