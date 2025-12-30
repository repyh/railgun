import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Files, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ExplorerPage: React.FC = () => {
    const { projectName, projectPath } = useProject();

    return (
        <div className="h-full w-full flex flex-col bg-background animate-in fade-in duration-500">
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                    <Files size={40} className="text-zinc-600" />
                </div>

                {projectName ? (
                    <div className="max-w-md">
                        <h2 className="text-2xl font-semibold text-zinc-100 mb-2">Workspace Explorer</h2>
                        <p className="text-zinc-500 mb-8">
                            Managing <span className="text-zinc-300 font-mono">{projectName}</span> at <br />
                            <span className="text-xs text-zinc-600">{projectPath}</span>
                        </p>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-left">
                            <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                                <AlertCircle size={14} />
                                File Explorer Active
                            </h3>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Use the sidebar on the left to navigate files. The modular explorer allows you to manage assets, commands, and events independently.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md">
                        <h2 className="text-2xl font-semibold text-zinc-100 mb-2">No Project Active</h2>
                        <p className="text-zinc-500 mb-8">Open or create a project to see your files here.</p>
                        <Button variant="outline" onClick={() => window.electronAPI?.invoke('project:openProject')}>Open Workspace</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplorerPage;
