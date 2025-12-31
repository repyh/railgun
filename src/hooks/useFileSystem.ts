import { useState, useCallback, useEffect } from 'react';
import { useElectron } from '@/hooks/useElectron';

export function useFileSystem(projectPath: string | null) {
    const [eventFiles, setEventFiles] = useState<string[]>([]);
    const [commandFiles, setCommandFiles] = useState<string[]>([]);
    const [slashCommandFiles, setSlashCommandFiles] = useState<string[]>([]);
    const [projectFiles, setProjectFiles] = useState<string[]>([]);
    const { isElectron, files } = useElectron();

    const loadFiles = useCallback(async () => {
        if (!projectPath || !isElectron) return;
        try {
            // Root project files
            const rootFiles = await files.list(projectPath, '.');
            if (rootFiles) {
                const filtered = rootFiles.filter((f: string) => f.endsWith('.railgun'));
                setProjectFiles(filtered);
            }

            const eFiles = await files.list(projectPath, 'events');
            if (eFiles) {
                const filtered = eFiles.filter((f: string) => f.endsWith('.railgun'));
                setEventFiles(filtered);
            }

            const cFiles = await files.list(projectPath, 'commands');
            if (cFiles) {
                const filtered = cFiles.filter((f: string) => f.endsWith('.railgun'));
                setCommandFiles(filtered);
            }

            const sFiles = await files.list(projectPath, 'slash_commands');
            if (sFiles) {
                const filtered = sFiles.filter((f: string) => f.endsWith('.railgun'));
                setSlashCommandFiles(filtered);
            }
        } catch (error) {
            console.error("Failed to load files", error);
        }
    }, [projectPath, isElectron, files]);

    // Initial load
    useEffect(() => {
        if (projectPath) {
            loadFiles();
            // Retry after a short delay to handle potential FS race conditions during project creation
            const timer = setTimeout(loadFiles, 500);
            return () => clearTimeout(timer);
        }
    }, [projectPath, loadFiles]);

    const deleteFile = useCallback(async (filePath: string) => {
        if (!projectPath || !isElectron) return false;
        try {
            const success = await files.delete(projectPath, filePath);
            if (success) {
                await loadFiles();
            }
            return success;
        } catch (e) {
            console.error('Failed to delete file', e);
            return false;
        }
    }, [projectPath, isElectron, files, loadFiles]);

    const createFile = useCallback(async (subDir: string, name: string, content: any) => {
        if (!projectPath || !isElectron) return null;

        const fileName = name.endsWith('.railgun') ? name : `${name}.railgun`;
        const filePath = `${subDir}/${fileName}`;

        try {
            await files.save(projectPath, filePath, JSON.stringify(content, null, 2));
            await loadFiles();
            return filePath;
        } catch (err) {
            console.error("Failed to create file", err);
            return null;
        }
    }, [projectPath, isElectron, files, loadFiles]);

    return {
        projectFiles,
        eventFiles,
        commandFiles,
        slashCommandFiles,
        loadFiles,
        deleteFile,
        createFile
    };
}
