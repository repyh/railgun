import React from 'react';
import { ChevronRight } from 'lucide-react';


interface InspectorFieldProps {
    label: string;
    subLabel?: string;
    children: React.ReactNode;
    className?: string;
}

export function InspectorField({ label, subLabel, children, className = '' }: InspectorFieldProps) {
    return (
        <div className={`flex items-center text-xs min-h-[24px] ${className}`}>
            {/* Label Column */}
            <div className="w-[120px] shrink-0 font-medium text-zinc-500 pl-1 pr-2 truncate flex items-center justify-between group cursor-default" title={label}>
                <span>{label}</span>
                {subLabel && <span className="text-[9px] text-zinc-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">{subLabel}</span>}
            </div>

            {/* Control Column */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}

export function InspectorSection({ title, children, initialOpen = true }: { title: string, children: React.ReactNode, initialOpen?: boolean }) {
    const [open, setOpen] = React.useState(initialOpen);

    return (
        <div className="mb-2">
            <div
                className="flex items-center bg-transparent h-7 px-2 cursor-pointer select-none hover:bg-white/5 transition-colors border-y border-white/5"
                onClick={() => setOpen(!open)}
            >
                <div className={`w-3 h-3 flex items-center justify-center mr-2 text-zinc-600 transition-transform ${open ? 'rotate-90' : ''}`}>
                    <ChevronRight size={10} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{title}</span>
            </div>

            {open && (
                <div className="py-1 flex flex-col gap-1 px-3">
                    {children}
                </div>
            )}
        </div>
    );
}
