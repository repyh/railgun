import { useState, useCallback, useEffect } from 'react';
import { useElectron } from '@/hooks/useElectron';

export function useFileSystem(projectPath: string | null) {
    const [eventFiles, setEventFiles] = useState<string[]>([]);
    const [commandFiles, setCommandFiles] = useState<string[]>([]);
    const [slashCommandFiles, setSlashCommandFiles] = useState<string[]>([]);
    const { isElectron, files } = useElectron();

    const loadFiles = useCallback(async () => {
        if (!projectPath || !isElectron) return;
        try {
            const eFiles = await files.list(projectPath, 'events');
            if (eFiles) {
                const filtered = eFiles.filter((f: string) => f.endsWith('.railgun.json'));
                setEventFiles(filtered);
            }

            const cFiles = await files.list(projectPath, 'commands');
            if (cFiles) {
                const filtered = cFiles.filter((f: string) => f.endsWith('.railgun.json'));
                setCommandFiles(filtered);
            }

            const sFiles = await files.list(projectPath, 'slash_commands');
            if (sFiles) {
                const filtered = sFiles.filter((f: string) => f.endsWith('.railgun.json'));
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

        const fileName = name.endsWith('.railgun.json') ? name : `${name}.railgun.json`;
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
        eventFiles,
        commandFiles,
        slashCommandFiles,
        loadFiles,
        deleteFile,
        createFile
    };
}
