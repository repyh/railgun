import React from 'react';
import { useDynamicViews } from '@/hooks/useDynamicViews';
import { Puzzle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface PluginToolbarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const PluginToolbar: React.FC<PluginToolbarProps> = ({ activeTab, onTabChange }) => {
    const dynamicViews = useDynamicViews();
    const toolbarViews = dynamicViews.filter((v: any) => v.target === 'toolbar');

    if (toolbarViews.length === 0) return null;

    return (
        <div className="flex items-center gap-1 pl-4 border-l border-zinc-800/50 ml-2">
            {toolbarViews.map((view: any) => {
                const reqIcon = view.icon || '';
                // @ts-ignore
                const IconComponent = LucideIcons[reqIcon] || Puzzle;
                const tabId = `plugin:${view.id}`;
                const isActive = activeTab === tabId;

                return (
                    <button
                        key={view.id}
                        onClick={() => onTabChange(tabId)}
                        title={view.label}
                        className={cn(
                            "p-1.5 rounded-md flex items-center gap-2 transition-all select-none border border-transparent",
                            isActive
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                        )}
                    >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-xs font-medium max-w-[100px] truncate">
                            {view.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
