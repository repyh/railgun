import React from 'react';
import { Layout, Settings, Package, Plug, Terminal as TerminalIcon } from 'lucide-react';
import { TabButton } from '@/components/ui/TabButton';
import type { TabType } from '@/hooks/useTabManager';

interface ExplorerTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const ExplorerTabs: React.FC<ExplorerTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="h-12 flex items-center border-b border-zinc-800 bg-zinc-900/50">
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
    );
};
