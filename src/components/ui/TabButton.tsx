import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon?: LucideIcon;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, icon: Icon }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-2 px-4 h-full text-sm font-medium border-b-2 transition-colors",
            active
                ? "border-blue-500 text-blue-400 bg-blue-500/5"
                : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
        )}
    >
        {Icon && <Icon size={16} />}
        {children}
    </button>
);
