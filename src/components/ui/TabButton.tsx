import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon?: LucideIcon;
    variant?: 'default' | 'pill';
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, icon: Icon, variant = 'default' }) => {

    if (variant === 'pill') {
        return (
            <button
                onClick={onClick}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all hover:cursor-pointer",
                    active
                        ? "bg-zinc-700 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                )}
            >
                {Icon && <Icon size={14} />}
                {children}
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 h-full text-sm font-medium border-b-2 transition-colors hover:cursor-pointer",
                active
                    ? "border-blue-500 text-blue-400 bg-blue-500/10"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
        >
            {Icon && <Icon size={16} />}
            {children}
        </button>
    );
};

