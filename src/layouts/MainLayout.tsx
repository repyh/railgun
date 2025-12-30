import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    SquareTerminal,
    Files,
    Search,
    GitGraph,
    Settings,
    Command,
    LayoutTemplate
} from 'lucide-react';

// interface MainLayoutProps {
//     children: React.ReactNode;
// }

const ActivityBarItem = ({
    icon: Icon,
    active = false,
    onClick
}: {
    icon: React.ElementType,
    active?: boolean,
    onClick?: () => void
}) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-3 w-full flex justify-center text-zinc-400 hover:text-white transition-colors relative",
                active && "text-white"
            )}
        >
            {active && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
            )}
            <Icon size={24} strokeWidth={1.5} />
        </button>
    );
};

import { PluginManager } from '@/lib/plugins/PluginManager';
import { ConsolePanel } from '@/components/console/ConsolePanel';
import { Titlebar } from '@/components/layout/Titlebar';
import { ModalProvider, useModal } from '@/contexts/ModalContext';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

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
    const [activeTab, setActiveTab] = useState('dashboard');
    const [appVersion, setAppVersion] = useState<string>('0.0.0');
    const [status, setStatus] = useState('Ready');
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);

    useEffect(() => {
        // Init Plugins
        PluginManager.init().catch(err => console.error("Plugin Init Failed:", err));

        // Example hook to get version if IPC is ready
        if (window.electronAPI) {
            window.electronAPI.invoke('system:getAppVersion').then(setAppVersion).catch(() => { });
        }
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            <Titlebar />

            {/* Middle Area: Activity Bar + Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Activity Bar */}
                <div className="w-12 border-r border-border flex flex-col items-center py-2 bg-zinc-900/50 pt-2">
                    <ActivityBarItem icon={LayoutTemplate} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <ActivityBarItem icon={Files} active={activeTab === 'explorer'} onClick={() => setActiveTab('explorer')} />
                    <ActivityBarItem icon={Search} active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
                    <ActivityBarItem icon={GitGraph} active={activeTab === 'git'} onClick={() => setActiveTab('git')} />
                    <div className="flex-1" />
                    <ActivityBarItem icon={Settings} />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Viewport */}
                    <main className="flex-1 overflow-auto relative p-0 bg-background/50">
                        <Outlet context={{ setStatus }} />
                    </main>

                    {/* Console Panel (Resizable/Toggleable in future, fixed height for now) */}
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
        </div>
    );
};

export const MainLayout = () => (
    <ModalProvider>
        <MainLayoutInner />
    </ModalProvider>
);
