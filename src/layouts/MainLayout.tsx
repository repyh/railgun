import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    SquareTerminal,
    Command
} from 'lucide-react';

import { PluginManager } from '@/lib/plugins/PluginManager';
import { useElectron } from '@/hooks/useElectron';
import { ConsolePanel } from '@/components/console/ConsolePanel';
import { Titlebar } from '@/components/layout/Titlebar';
import { ModalProvider, useModal } from '@/contexts/ModalContext';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { SIDEBAR_CONFIG, type SidebarItem } from '@/components/layout/sidebar';
import { VIEW_REGISTRY } from '@/views/viewRegistry';

const ActivityBarItem = ({
    item,
    active = false,
    onClick
}: {
    item: SidebarItem,
    active?: boolean,
    onClick?: () => void
}) => {
    const Icon = item.icon;
    return (
        <button
            onClick={onClick}
            title={item.label}
            className={cn(
                "p-3 w-full flex justify-center text-zinc-400 hover:text-white hover:cursor-pointer transition-colors relative group",
                active && "text-white"
            )}
        >
            {active && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
            )}
            <Icon size={24} strokeWidth={1.5} className={cn("transition-transform", active ? "scale-100" : "scale-90 group-hover:scale-100")} />
        </button>
    );
};

const ModalContainer = () => {
    const { activeModal, closeModal } = useModal();

    return (
        <>
            <CreateProjectModal
                open={activeModal === 'create-project'}
                onOpenChange={(open) => !open && closeModal()}
            />
            {/* Add other modals here as they are implemented */}
        </>
    );
};

export const MainLayoutInner = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { openModal } = useModal();
    const { isElectron, invoke, system } = useElectron();
    const [appVersion, setAppVersion] = useState<string>('0.0.0');
    const [status, setStatus] = useState('Ready');
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    useEffect(() => {
        // Init Plugins
        PluginManager.init().catch(err => console.error("Plugin Init Failed:", err));

        if (isElectron) {
            system.getAppVersion().then(setAppVersion).catch(() => { });
        }
    }, [isElectron, system]);

    const handleSidebarClick = (item: SidebarItem) => {
        if (item.path) {
            navigate(item.path);
        } else if (item.action) {
            const action = item.action;
            switch (action.type) {
                case 'modal':
                    openModal(action.target as any);
                    break;
                case 'ipc':
                    if (isElectron) {
                        invoke(action.target, ...(action.args || []));
                    }
                    break;
                case 'link':
                    if (isElectron) {
                        system.openExternalLink(action.target);
                    }
                    break;
                case 'command':
                    // TODO: Implement command palette integration
                    console.log('Sidebar Command:', action.target);
                    break;
            }
        }
    };

    const isItemActive = (item: SidebarItem) => {
        if (!item.path) return false;
        if (item.path === '/') return location.pathname === '/';
        return location.pathname.startsWith(item.path);
    };

    const bottomItems = SIDEBAR_CONFIG.filter(i => i.position === 'bottom');

    return (
        <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            <Titlebar />

            {/* Middle Area: Activity Bar + Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Activity Bar (Dashboard Switcher) */}
                <div className="w-12 border-r border-border flex flex-col items-center py-2 bg-zinc-900/50 pt-2 select-none">
                    <div className="flex-1 w-full space-y-1">
                        {VIEW_REGISTRY.map(item => (
                            <ActivityBarItem
                                key={item.id}
                                item={item as any}
                                active={isItemActive(item as any)}
                                onClick={() => navigate(item.path)}
                            />
                        ))}
                    </div>
                    <div className="w-full space-y-1">
                        {bottomItems.map(item => (
                            <ActivityBarItem
                                key={item.id}
                                item={item}
                                active={isItemActive(item)}
                                onClick={() => handleSidebarClick(item)}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <main className="flex-1 overflow-auto relative p-0 bg-background/50">
                        <Outlet context={{ setStatus }} />
                    </main>

                    {isConsoleOpen && (
                        <div className="h-48 shrink-0">
                            <ConsolePanel />
                        </div>
                    )}

                    {/* Status Bar */}
                    <div className="h-6 bg-blue-600/10 border-t border-blue-500/20 flex items-center px-3 text-xs justify-between select-none">
                        <div className="flex items-center gap-4 text-blue-200">
                            <button
                                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                                className={`flex items-center gap-1 hover:text-white transition-colors ${isConsoleOpen ? 'text-white' : 'text-blue-200/50'}`}
                            >
                                <SquareTerminal size={12} />
                                <span>Console</span>
                            </button>
                            <div className="flex items-center gap-1">
                                <Command size={12} />
                                <span>{status}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-400">
                            <span>TypeScript React</span>
                            <span>UTF-8</span>
                            <span>v{appVersion}</span>
                        </div>
                    </div>
                </div>
            </div>
            <ModalContainer />
        </div >
    );
};

export const MainLayout = () => (
    <ModalProvider>
        <MainLayoutInner />
    </ModalProvider>
);
