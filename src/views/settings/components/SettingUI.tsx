import React from 'react';
import { cn } from '@/lib/utils';

interface SettingGroupProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const SettingGroup: React.FC<SettingGroupProps> = ({
    title,
    description,
    children
}) => {
    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                        {title}
                    </h3>
                </div>
            </div>
            {description && (
                <p className="text-[11px] text-zinc-500 -mt-2 mb-4 leading-relaxed">
                    {description}
                </p>
            )}
            <div className="space-y-px">
                {children}
            </div>
        </div>
    );
};

interface SettingRowProps {
    label: string;
    description?: string;
    settingKey?: string;
    children: React.ReactNode;
}

export const SettingRow: React.FC<SettingRowProps> = ({
    label,
    description,
    settingKey,
    children
}) => {
    return (
        <div className="flex items-start justify-between p-4 bg-zinc-950/50 hover:bg-zinc-900/40 transition-colors gap-8">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-200">{label}</span>
                    {settingKey && (
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 font-mono border border-zinc-800/50 group-hover:text-zinc-400 transition-colors">
                            {settingKey}
                        </code>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex flex-col items-end gap-2 pt-0.5">
                {children}
            </div>
        </div>
    );
};

interface SettingControlProps {
    children: React.ReactNode;
    className?: string;
}

export const SettingControl: React.FC<SettingControlProps> = ({ children, className }) => {
    return (
        <div className={cn("flex items-center h-full", className)}>
            {children}
        </div>
    );
};

export const SettingToggle: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => (
    <div
        className={cn(
            "w-9 h-5 rounded-full relative cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none",
            checked ? "bg-blue-600 shadow-[0_0_10px_-2px_rgba(37,99,235,0.4)]" : "bg-zinc-800"
        )}
        onClick={() => onChange(!checked)}
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(!checked);
            }
        }}
    >
        <div
            className={cn(
                "absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-all duration-200",
                checked ? "translate-x-4 scale-110" : "translate-x-0"
            )}
        />
    </div>
);
