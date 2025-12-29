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
    LayoutTemplate,
    Minus,
    Square,
    X
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

export const MainLayout = () => {
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
            {/* Top Bar / Title Bar */}
            <div className="h-[30px] shrink-0 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 titlebar-drag-region select-none">
                <div className="flex items-center px-2 h-full titlebar-no-drag">
                    <div className="mr-3 text-blue-500">
                        <SquareTerminal size={16} />
                    </div>
                    <div className="flex items-center text-[13px]">
                        {['File', 'Edit', 'Plugins', 'View', 'Help'].map((item) => (
                            <div key={item} className="px-2.5 py-1 hover:bg-zinc-800 rounded-sm cursor-pointer text-zinc-400 hover:text-zinc-100 transition-colors">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 text-[13px] text-zinc-400 font-medium">
                    Railgun v0.0.1-alpha
                </div>

                {/* Custom Window Controls */}
                <div className="flex h-full titlebar-no-drag">
                    <button
                        onClick={() => window.electronAPI?.minimizeWindow()}
                        className="h-full px-4 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center justify-center"
                    >
                        <Minus size={16} />
                    </button>
                    <button
                        onClick={() => window.electronAPI?.toggleMaximizeWindow()}
                        className="h-full px-4 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center justify-center"
                    >
                        <Square size={14} />
                    </button>
                    <button
                        onClick={() => window.electronAPI?.closeWindow()}
                        className="h-full px-4 hover:bg-red-500 text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

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
        </div>
    );
};
