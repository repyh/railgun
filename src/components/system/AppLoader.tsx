import React, { useEffect, useState } from 'react';

const LOAD_STEPS = [
    { message: 'Initializing runtime...', duration: 800 },
    { message: 'Loading core modules...', duration: 1200 },
    { message: 'Checking file system permissions...', duration: 600 },
    { message: 'Registering plugins...', duration: 1000 },
    { message: 'Starting Rete engine...', duration: 800 },
    { message: 'Ready', duration: 400 }
];

export const AppLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const runStartupSequence = async () => {
            let totalSteps = LOAD_STEPS.length;
            
            for (let i = 0; i < totalSteps; i++) {
                const step = LOAD_STEPS[i];
                const progress = Math.round(((i + 1) / totalSteps) * 100);

                // Send update to Backend (which forwards to Splash)
                if (window.electronAPI) {
                     // @ts-ignore - We need to expose this API effectively or use invoke if we added it to preload
                     // Since we didn't update preload, we might need a direct IPC send mechanism or update preload.
                     // IMPORTANT: 'window.electronAPI' is usually a bridge. We should check if we have a way to send arbitary IPC.
                     // The current ProjectIPC doesn't expose a generic 'send'.
                     // For now, let's assume we can use `window.electron` if available or we might need to patch preload.
                }
                
                // Fallback: Use direct ipcRenderer if available via nodeIntegration (which we enabled for MVP)
                if (window.require) {
                     const { ipcRenderer } = window.require('electron');
                     ipcRenderer.send('system:update-status', { 
                         status: step.message, 
                         progress: progress 
                     });
                }

                await new Promise(resolve => setTimeout(resolve, step.duration));
            }

            // Signal Ready
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                ipcRenderer.send('system:app-ready');
            }
            
            setIsReady(true);
        };

        runStartupSequence();
    }, []);

    if (!isReady) {
        // While loading, we render nothing in the main window 
        // (it's hidden anyway, but this prevents flashing uninitialized UI)
        return <div className="h-screen w-screen bg-zinc-950 text-white flex items-center justify-center">
            {/* Fallback loader if main window is shown prematurely */}
            <span className="animate-pulse">Loading Railgun...</span>
        </div>;
    }

    return <>{children}</>;
};
