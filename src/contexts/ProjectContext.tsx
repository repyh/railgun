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
    const [projectPath, setProjectPath] = useState<string | null>(localStorage.getItem('lastProjectPath'));
    const [projectName, setProjectName] = useState<string | null>(localStorage.getItem('lastProjectName'));
    const [activeFile, setActiveFile] = useState<string | null>(localStorage.getItem('lastActiveFile'));

    useEffect(() => {
        if (projectPath) {
            localStorage.setItem('lastProjectPath', projectPath);
        } else {
            localStorage.removeItem('lastProjectPath');
        }
    }, [projectPath]);

    useEffect(() => {
        if (projectName) {
            localStorage.setItem('lastProjectName', projectName);
        } else {
            localStorage.removeItem('lastProjectName');
        }
    }, [projectName]);

    useEffect(() => {
        if (activeFile) {
            localStorage.setItem('lastActiveFile', activeFile);
        } else {
            localStorage.removeItem('lastActiveFile');
        }
    }, [activeFile]);

    const setProject = (path: string | null, name: string | null) => {
        setProjectPath(path);
        setProjectName(name);
        if (!path) setActiveFile(null); // Clear active file if project closed
    };

    return (
        <ProjectContext.Provider value={{
            projectPath,
            projectName,
            activeFile,
            setProject,
            setActiveFile
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
