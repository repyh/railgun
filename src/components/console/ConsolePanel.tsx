import React, { useEffect, useRef, useState } from 'react';
// import { AnsiUp } from 'ansi_up'; // Use if we add ansi support later

interface LogEntry {
    message: string;
    type: 'stdout' | 'stderr';
    timestamp: number;
}

export const ConsolePanel: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Listen for logs from main process
        const handleLog = (_: any, log: LogEntry) => {
            setLogs(prev => [...prev.slice(-999), log]); // Keep last 1000 logs
        };

        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.on('bot:log', handleLog);
            return () => {
                ipcRenderer.removeListener('bot:log', handleLog);
            };
        }
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 font-mono text-xs border-t border-zinc-800">
            {/* Header */}
            <div className="flex items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800 select-none">
                <span className="font-semibold text-zinc-400">Terminal</span>
                <div className="flex-1" />
                <button
                    onClick={() => setLogs([])}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Log Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {logs.length === 0 && (
                    <div className="text-zinc-600 italic">No output...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className={`wrap-break-word ${log.type === 'stderr' ? 'text-red-400' : 'text-zinc-300'}`}>
                        <span className="opacity-50 mr-2 select-none">
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        {log.message}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};
