import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useElectron } from '@/hooks/useElectron';

export const useRPCManager = () => {
    const { settings } = useSettings();
    const { projectPath, projectName, activeFile } = useProject();
    const location = useLocation();
    const { invoke, isElectron } = useElectron();
    const startTimeRef = useRef(Date.now());

    useEffect(() => {
        if (!isElectron) return;

        invoke('rpc:status', settings.system.discordRPC);
    }, [isElectron, settings.system.discordRPC, invoke]);

    useEffect(() => {
        if (!isElectron || !settings.system.discordRPC) return;

        const updatePresence = () => {
            let details = 'Idle';
            if (location.pathname === '/') details = 'On Dashboard';
            else if (location.pathname.startsWith('/explorer')) {
                details = 'Editing Graph';
                if (activeFile && settings.rpc.showCurrentFile) {
                    details = `Editing ${activeFile}`;
                }
            }
            else if (location.pathname.startsWith('/settings')) details = 'Configuring Settings';
            else if (location.pathname.startsWith('/plugins')) details = 'Browsing Plugins';

            if (settings.rpc.privacyMode) {
                details = 'Working in Railgun IDE';
            }

            let state = 'No Project Open';
            if (projectName && settings.rpc.showProjectName) {
                state = `Project: ${projectName}`;
            } else if (projectName && settings.rpc.privacyMode) {
                state = 'Working on a Project';
            }

            const payload: any = {
                details,
                state,

            };

            if (settings.rpc.showElapsedTime) {
                payload.startTimestamp = startTimeRef.current;
            }

            invoke('rpc:update', payload);
        };

        const interval = setInterval(updatePresence, 5000);
        updatePresence();
        return () => clearInterval(interval);

    }, [
        isElectron,
        settings.system.discordRPC,
        settings.rpc,
        location.pathname,
        projectName,
        projectPath,
        invoke
    ]);
};
