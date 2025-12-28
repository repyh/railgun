import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { cn } from '@/lib/utils';
import '@xterm/xterm/css/xterm.css';

interface ConsoleTabProps {
    className?: string;
    isActive: boolean;
    projectName: string;
    projectPath: string;
    autoInstall?: boolean;
}

export const ConsoleTab: React.FC<ConsoleTabProps> = ({
    className,
    isActive,
    projectName,
    projectPath,
    autoInstall
}) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const hasStartedInstall = useRef(false);

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
        if (!terminalRef.current || xtermRef.current) return;

        // Initialize XTerm
        const term = new Terminal({
            theme: {
                background: '#09090b',
                foreground: '#ffffff',
                cursor: '#3b82f6',
                selectionBackground: '#3b82f640'
            },
            fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
            fontSize: 13,
            cursorBlink: true,
            convertEol: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        term.writeln(`\x1b[36m${projectName} \x1b[0m initialized at \x1b[33m${projectPath} \x1b[0m`);
        term.writeln('Waiting for commands...');

        // Listen for data from backend
        let cleanupTerminalListener: (() => void) | undefined;

        if (window.electronAPI) {
            cleanupTerminalListener = window.electronAPI.onTerminalData((data) => {
                term.write(data);
            });
        }

        // Handle Resize
        const handleResize = () => fitAddon.fit();
        window.addEventListener('resize', handleResize);

        // Auto Install if requested
        if (autoInstall && !hasStartedInstall.current && window.electronAPI) {
            hasStartedInstall.current = true;
            term.writeln('\r\n\x1b[32m> Installing dependencies...\x1b[0m\r\n');
            setTimeout(() => {
                window.electronAPI.installDependencies(projectPath, 'nodejs')
                    .then(() => {
                        term.writeln('\r\n\x1b[32m> Dependencies installed.\x1b[0m\r\n');
                    })
                    .catch(err => {
                        term.writeln(`\r\n\x1b[31m > Install failed: ${err} \x1b[0m\r\n`);
                    });
            }, 500);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (cleanupTerminalListener) cleanupTerminalListener();
            term.dispose();
            xtermRef.current = null;
        };
    }, [projectName, projectPath, autoInstall]);

    return (
        <div className={cn("h-full w-full absolute inset-0 bg-[#09090b] flex flex-col p-4", isActive ? 'z-10' : '-z-10 opacity-0', className)}>
            <div
                ref={terminalRef}
                className="flex-1 w-full rounded-md border border-zinc-800 overflow-hidden bg-[#09090b]"
            />
        </div>
    );
};
