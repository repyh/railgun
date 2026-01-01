import { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';

export type TabType = 'workspace' | 'packages' | 'config' | 'console' | 'plugins' | 'variables';

export function useTabManager() {
    const { activeFile, setActiveFile } = useProject();
    const [activeTab, setActiveTab] = useState<TabType>('workspace');

    const openFile = (file: string) => {
        setActiveFile(file);
        setActiveTab('workspace');
    };

    const closeFile = () => {
        setActiveFile(null);
    };

    return {
        activeTab,
        setActiveTab,
        selectedFile: activeFile,
        openFile,
        closeFile
    };
}
