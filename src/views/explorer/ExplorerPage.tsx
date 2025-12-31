import React, { useEffect, useState } from 'react';
import { Files } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { PackagesTab } from '@/views/tabs/PackagesTab';
import { ConfigTab } from '@/views/tabs/ConfigTab';
import { ConsoleTab } from '@/views/tabs/ConsoleTab';
import { PluginsTab } from '@/views/tabs/PluginsTab';
import { ReteEditor } from '@/components/editor/ReteEditor';
import { CreateEventModal } from '@/components/modals/CreateEventModal';
import { CreateCommandModal } from '@/components/modals/CreateCommandModal';
import { CreateSlashCommandModal } from '@/components/modals/CreateSlashCommandModal';
import { useProject } from '@/contexts/ProjectContext';
import { PluginManager } from '@/lib/plugins/PluginManager';
import { RunConfigDialog } from '@/components/dialogs/RunConfigDialog';

// Hooks
import { useBotControl } from '@/hooks/useBotControl';
import { useFileSystem } from '@/hooks/useFileSystem';
import { useTabManager } from '@/hooks/useTabManager';

// Components
import { ExplorerSidebar } from './components/ExplorerSidebar';
import { ExplorerTabs } from './components/ExplorerTabs';
import { BotStatusPanel } from './components/BotStatusPanel';
import { FileKey } from 'lucide-react';

// Services
import { ProjectService } from '@/services/ProjectService';

const ExplorerPage: React.FC = () => {
    const { projectName, projectPath } = useProject();
    const navigate = useNavigate();

    // Editor State
    const { setStatus } = useOutletContext<any>() || {};

    // Custom Hooks
    const { activeTab, setActiveTab, selectedFile, openFile, closeFile } = useTabManager();
    const { status: botStatus, startBot, stopBot } = useBotControl(projectPath, setStatus);
    const { eventFiles, commandFiles, slashCommandFiles, deleteFile, createFile } = useFileSystem(projectPath);

    // Local State (that doesn't fit neatly into hooks yet or is UI specific)
    const [isRunConfigOpen, setIsRunConfigOpen] = useState(false);
    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
    const [isCreateCommandModalOpen, setIsCreateCommandModalOpen] = useState(false);
    const [isCreateSlashCommandModalOpen, setIsCreateSlashCommandModalOpen] = useState(false);

    // Init Plugin Manager
    useEffect(() => {
        if (projectPath) {
            PluginManager.init(projectPath);
        }
    }, [projectPath]);

    const handleRunBot = async () => {
        const result = await startBot();
        if (result && !result.success) {
            if (result.missingSecrets) {
                setIsRunConfigOpen(true);
            } else {
                alert(`Failed to start bot: ${result.error}`);
            }
        }
    };

    // EMPTY STATE
    if (!projectPath) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-background animate-in fade-in duration-500">
                <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/5">
                        <Files size={40} className="text-zinc-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-zinc-100 mb-2">No Project Active</h2>
                    <p className="text-zinc-500 mb-8">
                        The explorer is empty because no project is currently open.
                        Select a project from the Dashboard or create a new one to get started.
                    </p>
                    <Button variant="outline" onClick={() => navigate('/')}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    // MAIN IDE VIEW
    return (
        <div className="flex h-full bg-background animate-in fade-in zoom-in-95 duration-200">
            <ExplorerSidebar
                projectName={projectName}
                projectPath={projectPath}
                commandFiles={commandFiles}
                slashCommandFiles={slashCommandFiles}
                eventFiles={eventFiles}
                selectedFile={selectedFile}
                onFileClick={openFile}
                onDeleteFile={(file) => {
                    if (confirm(`Are you sure you want to delete ${file}?`)) {
                        deleteFile(file);
                        if (selectedFile === file) closeFile();
                    }
                }}
                onOpenCreateCommand={(e) => { e.stopPropagation(); setIsCreateCommandModalOpen(true); }}
                onOpenCreateSlashCommand={(e) => { e.stopPropagation(); setIsCreateSlashCommandModalOpen(true); }}
                onOpenCreateEvent={(e) => { e.stopPropagation(); setIsCreateEventModalOpen(true); }}
                onNavigateBack={() => navigate('/')}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                <ExplorerTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Run Controls Bar */}
                <div className="flex h-12 shrink-0">
                    <BotStatusPanel
                        status={botStatus}
                        onStart={handleRunBot}
                        onStop={stopBot}
                    />
                    <div className="flex items-center px-2 border-b border-zinc-800 bg-zinc-900/50 flex-1">
                        <div className="h-4 w-px bg-zinc-800 mx-2" />
                        <button
                            onClick={() => setIsRunConfigOpen(true)}
                            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                            title="Run Configuration"
                        >
                            <FileKey size={16} />
                        </button>
                    </div>
                </div>


                {/* Content Viewport */}
                <div className="flex-1 relative overflow-hidden">
                    <div className={`absolute inset-0 ${activeTab === 'console' ? 'block' : 'hidden'}`}>
                        <ConsoleTab
                            isActive={activeTab === 'console'}
                        />
                    </div>

                    {activeTab === 'workspace' && (
                        <div className="h-full w-full relative">
                            {selectedFile ? (
                                <ReteEditor
                                    projectPath={projectPath!}
                                    filePath={selectedFile!}
                                    setStatus={setStatus}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-zinc-500">
                                    Select an event file to edit
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'config' && <ConfigTab projectPath={projectPath} />}
                    {activeTab === 'packages' && <PackagesTab projectPath={projectPath} />}
                    {activeTab === 'plugins' && <PluginsTab />}
                </div>
            </div>

            <CreateEventModal
                open={isCreateEventModalOpen}
                onOpenChange={setIsCreateEventModalOpen}
                onCreateEvent={async (name, type) => {
                    try {
                        const path = await ProjectService.createEvent(name, type, createFile);
                        if (path) openFile(path);
                    } catch (e) {
                        alert("Failed to create event: " + e);
                    }
                }}
            />
            <CreateCommandModal
                open={isCreateCommandModalOpen}
                onOpenChange={setIsCreateCommandModalOpen}
                onCreateCommand={async (name, args) => {
                    try {
                        const path = await ProjectService.createCommand(name, args || [], createFile);
                        if (path) openFile(path);
                    } catch (e) {
                        alert("Failed to create command: " + e);
                    }
                }}
            />
            <CreateSlashCommandModal
                open={isCreateSlashCommandModalOpen}
                onOpenChange={setIsCreateSlashCommandModalOpen}
                onCreateCommand={async (name, description, options) => {
                    try {
                        const path = await ProjectService.createSlashCommand(name, description, options, createFile);
                        if (path) openFile(path);
                    } catch (e) {
                        alert("Failed to create slash command: " + e);
                    }
                }}
            />

            <RunConfigDialog
                open={isRunConfigOpen}
                onOpenChange={setIsRunConfigOpen}
            />
        </div>
    );
};

export default ExplorerPage;
