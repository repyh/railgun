import React from 'react';
import { Play, Square } from 'lucide-react';

interface BotStatusPanelProps {
    status: 'stopped' | 'running';
    onStart: () => void;
    onStop: () => void;
}

export const BotStatusPanel: React.FC<BotStatusPanelProps> = ({ status, onStart, onStop }) => {
    return (
        <div className="flex items-center gap-2">
            {status === 'stopped' ? (
                <button
                    onClick={onStart}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600/90 hover:bg-green-500 text-white rounded text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                    <Play size={14} fill="currentColor" />
                    <span>Run Bot</span>
                </button>
            ) : (
                <button
                    onClick={onStop}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                    <Square size={14} fill="currentColor" />
                    <span>Stop Bot</span>
                </button>
            )}
        </div>
    );
};
