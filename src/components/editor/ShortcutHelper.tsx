import { Keyboard } from 'lucide-react';

interface ShortcutHelperProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ShortcutHelper({ isOpen, onClose }: ShortcutHelperProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div
                className="w-[340px] bg-[#1c1c1f] border border-zinc-800/50 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Keyboard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-zinc-100 font-bold text-sm">Keyboard Shortcuts</h3>
                        <p className="text-zinc-500 text-[10px]">Master the editor with speed</p>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <ShortcutItem keys={['Ctrl', 'S']} label="Save Project" />
                    <ShortcutItem keys={['Ctrl', 'D']} label="Duplicate Selection" />
                    <ShortcutItem keys={['Ctrl', 'C']} label="Copy Selection" />
                    <ShortcutItem keys={['Ctrl', 'V']} label="Paste Selection" />
                    <ShortcutItem keys={['Ctrl', 'A']} label="Select All" />
                    <div className="h-px bg-zinc-800/50 my-2" />
                    <ShortcutItem keys={['Ctrl', 'Z']} label="Undo" />
                    <ShortcutItem keys={['Ctrl', 'Y']} label="Redo" />
                    <ShortcutItem keys={['Shift', 'F']} label="Zoom to Fit" />
                    <ShortcutItem keys={['Del']} label="Delete Selection" />
                    <ShortcutItem keys={['H']} label="Toggle Shortcuts" />
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-all active:scale-[0.98]"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}

function ShortcutItem({ keys, label }: { keys: string[], label: string }) {
    return (
        <div className="flex items-center justify-between group">
            <span className="text-zinc-400 text-xs group-hover:text-zinc-300 transition-colors uppercase tracking-tight font-medium">{label}</span>
            <div className="flex gap-1">
                {keys.map((key, i) => (
                    <kbd
                        key={i}
                        className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-zinc-800 border border-zinc-700 rounded text-[9px] text-zinc-200 font-bold shadow-sm"
                    >
                        {key}
                    </kbd>
                ))}
            </div>
        </div>
    );
}
