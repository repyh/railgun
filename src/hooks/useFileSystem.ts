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
            // Root project files (.railgun config)
            const railgunFiles = await files.list(projectPath, '.railgun');
            if (railgunFiles) {
                const filtered = railgunFiles.filter((f: string) => f.endsWith('.railgun'));
                setProjectFiles(filtered);
            }

            const eFiles = await files.list(projectPath, 'src/events');
            if (eFiles) {
                const filtered = eFiles.filter((f: string) => f.endsWith('.railgun'));
                setEventFiles(filtered);
            }

            const cFiles = await files.list(projectPath, 'src/commands');
            if (cFiles) {
                // We merge both legacy and slash commands into 'commands' technical group
                const filtered = cFiles.filter((f: string) => f.endsWith('.railgun'));
                setCommandFiles(filtered);
                setSlashCommandFiles([]); // Clear slash commands list if we are merging, or handle separately if folder exists
            }

            // Check if slash_commands still exists for legacy projects
            const sFiles = await files.list(projectPath, 'src/slash_commands');
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

        // Map logical folder to physical path
        let physicalDir = subDir;
        if (subDir === 'events') physicalDir = 'src/events';
        if (subDir === 'commands') physicalDir = 'src/commands';
        if (subDir === 'slash_commands') physicalDir = 'src/commands'; // Merge into commands by default
        if (subDir === 'project') physicalDir = '.railgun';

        const filePath = `${physicalDir}/${fileName}`;

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
