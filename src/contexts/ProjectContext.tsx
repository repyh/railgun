import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProjectContextType {
    projectPath: string | null;
    projectName: string | null;
    setProject: (path: string | null, name: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projectPath, setProjectPath] = useState<string | null>(localStorage.getItem('lastProjectPath'));
    const [projectName, setProjectName] = useState<string | null>(localStorage.getItem('lastProjectName'));

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

    const setProject = (path: string | null, name: string | null) => {
        setProjectPath(path);
        setProjectName(name);
    };

    return (
        <ProjectContext.Provider value={{ projectPath, projectName, setProject }}>
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
