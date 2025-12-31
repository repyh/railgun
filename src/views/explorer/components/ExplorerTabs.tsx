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
        <div className="h-12 flex items-center border-b border-zinc-800 bg-zinc-900/50 pr-2">
            <div className="flex items-center h-full">
                <TabButton
                    active={activeTab === 'workspace'}
                    onClick={() => onTabChange('workspace')}
                    icon={Layout}
                >
                    Blueprint
                </TabButton>
                <TabButton
                    active={activeTab === 'config'}
                    icon={Settings}
                    onClick={() => onTabChange('config')}
                >
                    Config
                </TabButton>
                <TabButton
                    active={activeTab === 'packages'}
                    icon={Package}
                    onClick={() => onTabChange('packages')}
                >
                    Packages
                </TabButton>
                <TabButton
                    active={activeTab === 'plugins'}
                    icon={Plug}
                    onClick={() => onTabChange('plugins')}
                >
                    Plugins
                </TabButton>
                <TabButton
                    active={activeTab === 'console'}
                    onClick={() => onTabChange('console')}
                    icon={TerminalIcon}
                >
                    Console
                </TabButton>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    );
};
