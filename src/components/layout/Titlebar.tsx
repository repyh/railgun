import React, { useState } from 'react';
import {
    SquareTerminal,
    Minus,
    Square,
    X,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProject } from '@/contexts/ProjectContext';
import { useModal, type ModalType } from '@/contexts/ModalContext';
import { MENU_CONFIG, type MenuItem, type MenuAction } from './menu';

const MenuDropdown = ({ label, items, isOpen, onToggle, onAction }: { label: string, items: MenuItem[], isOpen: boolean, onToggle: () => void, onAction: (action: MenuAction) => void }) => {
    return (
        <div className="relative h-full">
            <button
                onClick={onToggle}
                className={cn(
                    "px-3 h-full flex items-center text-[13px] transition-colors gap-1.5",
                    isOpen ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                )}
            >
                {label}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 w-56 bg-zinc-900 border border-zinc-800 rounded-b-md shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {items.map((item, idx) => (
                        <React.Fragment key={idx}>
                            {item.divider ? (
                                <div className="my-1 border-t border-zinc-800" />
                            ) : (
                                <button
                                    onClick={() => {
                                        if (item.action) onAction(item.action);
                                        onToggle();
                                    }}
                                    disabled={item.disabled}
                                    className={cn(
                                        "w-full px-3 py-1.5 flex items-center justify-between text-[12px] transition-colors group",
                                        item.disabled ? "opacity-50 cursor-not-allowed" : "text-zinc-300 hover:bg-blue-600 hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        {item.icon && <item.icon size={14} className="text-zinc-500 group-hover:text-white" />}
                                        <span>{item.label}</span>
                                    </div>
                                    {item.shortcut && <span className="text-[10px] text-zinc-500 group-hover:text-blue-100 font-mono">{item.shortcut}</span>}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

export const Titlebar = () => {
    const { projectName } = useProject();
    const { openModal } = useModal();
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const toggleMenu = (menu: string) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const handleAction = async (action: MenuAction) => {
        switch (action.type) {
            case 'ipc':
                if (window.electronAPI) {
                    await window.electronAPI.invoke(action.target, ...(action.args || []));
                }
                break;
            case 'modal':
                openModal(action.target as ModalType);
                break;
            case 'command':
                console.log('Execute command:', action.target);
                // TODO: Integrate with command palette or project bridge
                break;
            case 'link':
                if (window.electronAPI) {
                    await window.electronAPI.invoke('titlebar:openExternalLink', action.target);
                }
                break;
        }
    };

    const windowControls = {
        minimize: () => window.electronAPI?.invoke('titlebar:minimizeWindow'),
        toggleMaximize: () => window.electronAPI?.invoke('titlebar:toggleMaximizeWindow'),
        close: () => window.electronAPI?.invoke('titlebar:closeWindow')
    };

    return (
        <div className="h-[30px] shrink-0 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 titlebar-drag-region select-none z-50">
            {/* Left Side: Logo & Menus */}
            <div className="flex items-center h-full titlebar-no-drag">
                <div className="px-3 text-blue-500 hover:text-blue-400 transition-colors cursor-default">
                    <SquareTerminal size={16} />
                </div>

                <div className="flex items-center h-full">
                    <MenuDropdown
                        label="File"
                        items={MENU_CONFIG.file}
                        isOpen={openMenu === 'file'}
                        onToggle={() => toggleMenu('file')}
                        onAction={handleAction}
                    />
                    <MenuDropdown
                        label="Edit"
                        items={MENU_CONFIG.edit}
                        isOpen={openMenu === 'edit'}
                        onToggle={() => toggleMenu('edit')}
                        onAction={handleAction}
                    />
                    <MenuDropdown
                        label="Plugins"
                        items={MENU_CONFIG.plugins}
                        isOpen={openMenu === 'plugins'}
                        onToggle={() => toggleMenu('plugins')}
                        onAction={handleAction}
                    />
                    <MenuDropdown
                        label="View"
                        items={MENU_CONFIG.view}
                        isOpen={openMenu === 'view'}
                        onToggle={() => toggleMenu('view')}
                        onAction={handleAction}
                    />
                    <MenuDropdown
                        label="Help"
                        items={MENU_CONFIG.help}
                        isOpen={openMenu === 'help'}
                        onToggle={() => toggleMenu('help')}
                        onAction={handleAction}
                    />
                </div>
            </div>

            {/* Center: Search & Project Info */}
            <div className="w-full flex items-center justify-center gap-2 h-full py-1 titlebar-no-drag">
                <div className="group flex items-center bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-md px-2.5 py-0.5 min-w-[300px] transition-all cursor-text">
                    <Search size={12} className="text-zinc-500 group-hover:text-zinc-400 mr-2" />
                    <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400 truncate max-w-[400px]">
                        {projectName ? `${projectName} - Railgun` : 'Search or type a command...'}
                    </span>
                </div>
            </div>

            {/* Right Side: Window Controls */}
            <div className="flex h-full titlebar-no-drag">
                <button
                    onClick={windowControls.minimize}
                    className="h-full px-4 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center justify-center"
                >
                    <Minus size={14} />
                </button>
                <button
                    onClick={windowControls.toggleMaximize}
                    className="h-full px-4 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center justify-center"
                >
                    <Square size={12} />
                </button>
                <button
                    onClick={windowControls.close}
                    className="h-full px-4 hover:bg-red-500/90 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Backdrop click-away for menus */}
            {openMenu && (
                <div
                    className="fixed inset-0 z-40 bg-transparent titlebar-no-drag"
                    onClick={() => setOpenMenu(null)}
                />
            )}
        </div>
    );
};
