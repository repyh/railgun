import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useProject } from '@/contexts/ProjectContext';
import { useElectron } from '@/hooks/useElectron';
import { cn } from '@/lib/utils';
import '@xterm/xterm/css/xterm.css';

interface ConsoleTabProps {
    className?: string;
    isActive: boolean;
    autoInstall?: boolean;
}

export const ConsoleTab: React.FC<ConsoleTabProps> = ({
    className,
    isActive,
    autoInstall
}) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const hasStartedInstall = useRef(false);

    const { projectPath, projectName } = useProject();

    const { isElectron, terminal, bot } = useElectron();

    // Re-fit terminal when it becomes active
    useEffect(() => {
        if (isActive && fitAddonRef.current) {
            // Small timeout to allow layout to paint
            setTimeout(() => {
                fitAddonRef.current?.fit();
            }, 10);
        }
    }, [isActive]);

    useEffect(() => {
        if (!projectName || !projectPath) return;
        if (!terminalRef.current) return;
        if (xtermRef.current) return; // Prevent re-initialization

        // Initialize XTerm
        const term = new Terminal({
            theme: {
                background: '#09090b',
                foreground: '#f4f4f5',
                cursor: '#52525b',
                selectionBackground: '#3f3f46',
                black: '#27272a',
                red: '#ef4444',
                green: '#22c55e',
                yellow: '#eab308',
                blue: '#3b82f6',
                magenta: '#a855f7',
                cyan: '#06b6d4',
                white: '#fafafa',
                brightBlack: '#71717a',
                brightRed: '#f87171',
                brightGreen: '#4ade80',
                brightYellow: '#fde047',
                brightBlue: '#60a5fa',
                brightMagenta: '#c084fc',
                brightCyan: '#22d3ee',
                brightWhite: '#ffffff',
            },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 13,
            lineHeight: 1.4,
            cursorBlink: true,
            convertEol: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);

        // FIT IMMEDIATELY needs a small delay for DOM to paint
        setTimeout(() => {
            fitAddon.fit();
        }, 10);

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        term.writeln(`\x1b[36m${projectName} \x1b[0m initialized at \x1b[33m${projectPath} \x1b[0m`);
        term.writeln('Waiting for commands...');

        // --- Hook up IPC ---
        let cleanupTerminalListener: (() => void) | undefined;
        let cleanupBotLogListener: (() => void) | undefined;

        if (isElectron) {
            // Fetch buffered logs
            bot.getLogs().then((logs: { message: string, type: 'stdout' | 'stderr' }[]) => {
                logs.forEach(log => {
                    const color = log.type === 'stderr' ? '\x1b[31m' : '\x1b[37m';
                    const msg = log.message.endsWith('\n') ? log.message : log.message + '\r\n';
                    term.write(`${color}${msg}\x1b[0m`);
                });
            });

            cleanupTerminalListener = terminal.onData((data: string) => {
                term.write(data);
            });

            cleanupBotLogListener = bot.onLog((log: { message: string, type: 'stdout' | 'stderr' }) => {
                // Format: [stdout] message
                const color = log.type === 'stderr' ? '\x1b[31m' : '\x1b[37m';
                // Ensure newlines if missing
                const msg = log.message.endsWith('\n') ? log.message : log.message + '\r\n';
                term.write(`${color}${msg}\x1b[0m`);
            });
        }

        // Handle Resize with ResizeObserver on the container
        const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit();
        });

        if (terminalRef.current) {
            resizeObserver.observe(terminalRef.current);
        }

        // Auto Install if requested
        if (autoInstall && !hasStartedInstall.current && isElectron) {
            hasStartedInstall.current = true;
            term.writeln('\r\n\x1b[32m> Installing dependencies...\x1b[0m\r\n');
            setTimeout(() => {
                terminal.installDependencies(projectPath, 'nodejs')
                    .then(() => {
                        term.writeln('\r\n\x1b[32m> Dependencies installed.\x1b[0m\r\n');
                    })
                    .catch(err => {
                        term.writeln(`\r\n\x1b[31m > Install failed: ${err} \x1b[0m\r\n`);
                    });
            }, 500);
        }

        return () => {
            resizeObserver.disconnect();
            if (cleanupTerminalListener) cleanupTerminalListener();
            if (cleanupBotLogListener) cleanupBotLogListener();
            term.dispose();
            xtermRef.current = null;
        };
    }, [projectName, projectPath, autoInstall, isElectron]);

    return (
        <div className={cn("h-full w-full absolute inset-0 bg-background flex flex-col", isActive ? 'z-10' : '-z-10 opacity-0', className)}>
            <div className="h-9 bg-zinc-900/50 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-medium text-zinc-200">Terminal</h2>
                </div>
            </div>

            <div className="flex-1 relative bg-black">
                <div
                    ref={terminalRef}
                    className="h-full w-full overflow-hidden"
                />
            </div>
        </div>
    );
};
