import React from 'react';
import { Play, Square } from 'lucide-react';

interface BotStatusPanelProps {
    status: 'stopped' | 'running';
    onStart: () => void;
    onStop: () => void;
}

export const BotStatusPanel: React.FC<BotStatusPanelProps> = ({ status, onStart, onStop }) => {
    return (
        <div className="flex items-center gap-2 px-4 h-12 border-b border-zinc-800 bg-zinc-900/50">
            {status === 'stopped' ? (
                <button
                    onClick={onStart}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-medium transition-colors"
                >
                    <Play size={14} fill="currentColor" />
                    <span>Run Bot</span>
                </button>
            ) : (
                <button
                    onClick={onStop}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors"
                >
                    <Square size={14} fill="currentColor" />
                    <span>Stop Bot</span>
                </button>
            )}
        </div>
    );
};
