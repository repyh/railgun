import React from 'react';
import { Layout, Settings, Package, Plug, Terminal as TerminalIcon } from 'lucide-react';
import { TabButton } from '@/components/ui/TabButton';
import type { TabType } from '@/hooks/useTabManager';

interface ExplorerTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    children?: React.ReactNode;
}

export const ExplorerTabs: React.FC<ExplorerTabsProps> = ({ activeTab, onTabChange, children }) => {
    return (
        <div className="h-12 flex items-center bg-zinc-900 border-b border-zinc-800 px-1 gap-4">

            {/* Primary Navigation */}
            <div className="flex items-center gap-1 p-1 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                <TabButton
                    active={activeTab === 'workspace'}
                    onClick={() => onTabChange('workspace')}
                    icon={Layout}
                    variant="pill"
                >
                    Blueprint
                </TabButton>
                <TabButton
                    active={activeTab === 'config'}
                    icon={Settings}
                    onClick={() => onTabChange('config')}
                    variant="pill"
                >
                    Config
                </TabButton>
                <TabButton
                    active={activeTab === 'packages'}
                    icon={Package}
                    onClick={() => onTabChange('packages')}
                    variant="pill"
                >
                    Packages
                </TabButton>

                <TabButton
                    active={activeTab === 'plugins'}
                    icon={Plug}
                    onClick={() => onTabChange('plugins')}
                    variant="pill"
                >
                    Plugins
                </TabButton>
                <TabButton
                    active={activeTab === 'console'}
                    onClick={() => onTabChange('console')}
                    icon={TerminalIcon}
                    variant="pill"
                >
                    Console
                </TabButton>
            </div>

            <div className="flex-1" />

            {/* Actions Area */}
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    );
};
