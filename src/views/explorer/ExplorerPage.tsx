import React, { useEffect, useState } from 'react';
import { Files } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { PackagesTab } from '@/views/tabs/PackagesTab';
import { ConfigTab } from '@/views/tabs/ConfigTab';
import { ConsoleTab } from '@/views/tabs/ConsoleTab';
import { PluginsTab } from '@/views/tabs/PluginsTab';
import { VariablesTab } from '@/views/tabs/VariablesTab';
import FlowEditor from '@/components/editor/FlowEditor';
import { ReactFlowProvider } from '@xyflow/react';
import { CreateEventModal } from '@/components/modals/CreateEventModal';
import { CreateCommandModal } from '@/components/modals/CreateCommandModal';
import { CreateSlashCommandModal } from '@/components/modals/CreateSlashCommandModal';
import { useProject } from '@/contexts/ProjectContext';
import { PluginManager } from '@/lib/plugins/PluginManager';
import { RunConfigModal } from '@/components/modals/RunConfigModal';
import { ProblemsPanel } from '@/components/editor/ProblemsPanel';
import { PropertyPanel } from '@/components/editor/PropertyPanel';
import { type ValidationIssue } from '@/lib/validation/types';
import type { CompilerNode } from '@/lib/compiler/graphTypes';

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
    const { projectName, projectPath, setProject } = useProject();
    const navigate = useNavigate();

    // Editor State
    const { setStatus } = useOutletContext<any>() || {};
    // const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // Removed
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    const [isProblemsVisible, setIsProblemsVisible] = useState(false);
    const [selectedBotNode, setSelectedBotNode] = useState<CompilerNode | null>(null);
    const [onNodeUpdate, setOnNodeUpdate] = useState<((id: string, data: any) => void) | null>(null);

    // Custom Hooks
    const { activeTab, setActiveTab, selectedFile, openFile, closeFile } = useTabManager();
    const { status: botStatus, startBot, stopBot } = useBotControl(projectPath, setStatus);
    const { eventFiles, commandFiles, slashCommandFiles, projectFiles, deleteFile, createFile, loadFiles } = useFileSystem(projectPath);

    // Local State (that doesn't fit neatly into hooks yet or is UI specific)
    const [isRunConfigOpen, setIsRunConfigOpen] = useState(false);
    const [runBotAfterConfig, setRunBotAfterConfig] = useState(false);
    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
    const [isCreateCommandModalOpen, setIsCreateCommandModalOpen] = useState(false);
    const [isCreateSlashCommandModalOpen, setIsCreateSlashCommandModalOpen] = useState(false);

    // Sync selected node with PropertyPanel (Virtual BotNode)
    // useEffect(() => {
    //     if (!selectedNodeId) {
    //         setSelectedBotNode(null);
    //         return;
    //     }
    //
    //     // We need a way to find the node data to populate the panel
    //     // For now, we'll assume the editor is handling data.
    //     // The PropertyPanel expects a BotNode from railgun-rete.
    //     // This is a bridge:
    //     const node = new BotNode("Loading...", "Action");
    //     node.id = selectedNodeId;
    //     // In a real implementation, we'd need to fetch the actual node data from the editor state
    //     // and map it to this BotNode instance.
    //     setSelectedBotNode(node);
    // }, [selectedNodeId]);

    const [isVerified, setIsVerified] = useState(false);

    // 1. Verify Project Exists
    useEffect(() => {
        setIsVerified(false); // Reset on path change
        if (projectPath) {
            const verify = () => {
                if (window.electronAPI) {
                    window.electronAPI.invoke('project:verifyProject', projectPath).then((exists: boolean) => {
                        if (!exists) {
                            // Silent failure: just clear the project state.
                            // The UI will return to the "No Project Active" empty state.
                            setProject(null, null);
                        } else {
                            setIsVerified(true);
                        }
                    });
                }
            };
            verify();
            window.addEventListener('focus', verify);
            return () => window.removeEventListener('focus', verify);
        }
    }, [projectPath, navigate]);

    // 2. Initialize Plugins (ONLY after verification)
    useEffect(() => {
        if (projectPath && isVerified) {
            PluginManager.init(projectPath);
        }
    }, [projectPath, isVerified]);

    const handleRunBot = async () => {
        const result = await startBot();
        if (result && !result.success) {
            if (result.missingSecrets) {
                setRunBotAfterConfig(true);
                setIsRunConfigOpen(true);
            } else {
                alert(`Failed to start bot: ${result.error}`);
            }
        }
    };

    const handleNodeSelection = React.useCallback((node: CompilerNode | null, updateFn?: (id: string, data: any) => void) => {
        setSelectedBotNode(node);
        setOnNodeUpdate(() => updateFn || null);
    }, []);

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

    // LOADING / VERIFYING STATE
    if (projectPath && !isVerified) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-background animate-in fade-in duration-200">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-r-2 border-transparent mb-4" />
                <p className="text-zinc-500 text-sm">Verifying project...</p>
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
                projectFiles={projectFiles}
                selectedFile={selectedFile}
                onFileClick={openFile}
                onRefresh={loadFiles} // Pass manual refresh
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
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#141416]">
                <ExplorerTabs activeTab={activeTab} onTabChange={setActiveTab}>
                    <div className="h-4 w-px bg-zinc-800 mx-2" />
                    <BotStatusPanel
                        status={botStatus}
                        onStart={handleRunBot}
                        onStop={stopBot}
                    />
                    <button
                        onClick={() => setIsRunConfigOpen(true)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                        title="Run Configuration"
                    >
                        <FileKey size={16} />
                    </button>
                </ExplorerTabs>


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
                                <ReactFlowProvider>
                                    <div className="flex h-full w-full overflow-hidden">
                                        <div className="flex-1 relative flex flex-col h-full overflow-hidden">
                                            <FlowEditor
                                                key={selectedFile}
                                                projectPath={projectPath!}
                                                filePath={selectedFile!}
                                                setStatus={setStatus}
                                                onSelectionChange={handleNodeSelection}
                                                onValidationChange={(issues) => {
                                                    setValidationIssues(issues);
                                                    if (issues.length > 0 && !isProblemsVisible) {
                                                        // Auto-show problems? Maybe persistent state is better
                                                    }
                                                }}
                                            />
                                            <ProblemsPanel
                                                issues={validationIssues}
                                                isVisible={isProblemsVisible}
                                                onClose={() => setIsProblemsVisible(false)}
                                                onJumpToNode={(id) => {
                                                    // Jump logic would need to be implemented in FlowEditor or via a ref
                                                    console.log('Jump to', id);
                                                }}
                                            />

                                            {/* Status Bar for Problems Toggle */}
                                            <div className="h-6 bg-[#171719] border-t border-zinc-800 flex items-center px-4 justify-between shrink-0">
                                                <button
                                                    onClick={() => setIsProblemsVisible(!isProblemsVisible)}
                                                    className="flex items-center gap-4 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <span className={validationIssues.filter(i => i.severity === 'error').length > 0 ? "text-red-500" : ""}>
                                                            ⓧ {validationIssues.filter(i => i.severity === 'error').length}
                                                        </span>
                                                        <span className={validationIssues.filter(i => i.severity === 'warning').length > 0 ? "text-yellow-500" : ""}>
                                                            ⚠️ {validationIssues.filter(i => i.severity === 'warning').length}
                                                        </span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {selectedBotNode && (
                                            <PropertyPanel
                                                node={selectedBotNode}
                                                onNodeUpdate={onNodeUpdate || undefined}
                                                onClose={() => {
                                                    setSelectedBotNode(null);
                                                    setOnNodeUpdate(null);
                                                }}
                                            />
                                        )}
                                    </div>
                                </ReactFlowProvider>
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
                    {activeTab === 'variables' && <VariablesTab projectPath={projectPath} />}
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

            <RunConfigModal
                open={isRunConfigOpen}
                onOpenChange={(open) => {
                    setIsRunConfigOpen(open);
                    if (!open) setRunBotAfterConfig(false);
                }}
                onSave={(secrets) => {
                    if (runBotAfterConfig) {
                        startBot(secrets);
                    }
                }}
            />
        </div>
    );
};

export default ExplorerPage;
