import { useState } from 'react';

export type TabType = 'workspace' | 'packages' | 'console' | 'config' | 'plugins';

export function useTabManager() {
    const [activeTab, setActiveTab] = useState<TabType>('workspace');
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const openFile = (file: string) => {
        setSelectedFile(file);
        setActiveTab('workspace');
    };

    const closeFile = () => {
        setSelectedFile(null);
    };

    return {
        activeTab,
        setActiveTab,
        selectedFile,
        openFile,
        closeFile
    };
}
