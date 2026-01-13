import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProjectContextType {
    projectPath: string | null;
    projectName: string | null;
    activeFile: string | null;
    setProject: (path: string | null, name: string | null) => void;
    setActiveFile: (file: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projectPath, setProjectPath] = useState<string | null>(null);
    const [projectName, setProjectName] = useState<string | null>(null);
    const [activeFile, setActiveFile] = useState<string | null>(null);

    useEffect(() => {
        const loadProjectState = async () => {
            // @ts-ignore
            const storage = window.electronAPI?.storage;
            if (!storage) return;

            try {
                // 1. Try to load from main config
                const configStr = await storage.getConfig();
                if (configStr) {
                    const config = JSON.parse(configStr);
                    if (config.state) {
                        if (config.state.lastProjectPath) setProjectPath(config.state.lastProjectPath);
                        if (config.state.lastProjectName) setProjectName(config.state.lastProjectName);
                        if (config.state.lastActiveFile) setActiveFile(config.state.lastActiveFile);
                        return;
                    }
                }

                // 2. Migration: Try legacy localStorage
                const legacyPath = localStorage.getItem('lastProjectPath');
                const legacyName = localStorage.getItem('lastProjectName');
                const legacyFile = localStorage.getItem('lastActiveFile');

                if (legacyPath) setProjectPath(legacyPath);
                if (legacyName) setProjectName(legacyName);
                if (legacyFile) setActiveFile(legacyFile);

                if (legacyPath || legacyName || legacyFile) {
                    const currentConfig = configStr ? JSON.parse(configStr) : {};
                    const nextConfig = {
                        ...currentConfig,
                        state: {
                            ...currentConfig.state,
                            lastProjectPath: legacyPath,
                            lastProjectName: legacyName,
                            lastActiveFile: legacyFile
                        }
                    };
                    await storage.setConfig(JSON.stringify(nextConfig, null, 2));
                    console.log("[ProjectContext] Migrated project state from localStorage.");
                }
            } catch (e) {
                console.error("Failed to load project state:", e);
            }
        };

        loadProjectState();
    }, []);

    const persistState = async (key: string, value: string | null) => {
        // @ts-ignore
        const storage = window.electronAPI?.storage;
        if (!storage) return;

        try {
            const configStr = await storage.getConfig();
            const config = configStr ? JSON.parse(configStr) : {};
            const nextConfig = {
                ...config,
                state: {
                    ...(config.state || {}),
                    [key]: value
                }
            };
            await storage.setConfig(JSON.stringify(nextConfig, null, 2));
        } catch (e) {
            console.error("Failed to persist project state:", e);
        }
    };

    const setProject = (path: string | null, name: string | null) => {
        setProjectPath(path);
        setProjectName(name);
        persistState('lastProjectPath', path);
        persistState('lastProjectName', name);
        if (!path) {
            setActiveFile(null);
            persistState('lastActiveFile', null);
        }
    };

    const updateActiveFile = (file: string | null) => {
        setActiveFile(file);
        persistState('lastActiveFile', file);
    };

    return (
        <ProjectContext.Provider value={{
            projectPath,
            projectName,
            activeFile,
            setProject,
            setActiveFile: updateActiveFile
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
