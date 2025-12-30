import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Zap,
    Terminal as TerminalIcon,
    Layout,
    ChevronRight,
    ChevronDown,
    Settings,
    Package,
    Database,
    Variable,
    FileCode,
    Plus,
    Trash2,
    Plug,
    Play,
    FileKey,
    Square,
    Files
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { TabButton } from '@/components/ui/TabButton';
import { PackagesTab } from '@/views/tabs/PackagesTab';
import { ConfigTab } from '@/views/tabs/ConfigTab';
import { ConsoleTab } from '@/views/tabs/ConsoleTab';
import { PluginsTab } from '@/views/tabs/PluginsTab';
import { ReteEditor } from '@/components/editor/ReteEditor';
import { CreateEventModal } from '@/components/modals/CreateEventModal';
import { CreateCommandModal } from '@/components/modals/CreateCommandModal';
import { useProject } from '@/contexts/ProjectContext';
import { PluginManager } from '@/lib/plugins/PluginManager';
import { RunConfigDialog } from '@/components/dialogs/RunConfigDialog';
import { eventRegistry } from '@/lib/registries/EventRegistry';
import { commandRegistry } from '@/lib/registries/CommandRegistry';

const TreeItem = ({ label, icon: Icon, children, onClick, active, action }: { label: string, icon?: any, children?: React.ReactNode, onClick?: () => void, active?: boolean, action?: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isLeaf = !children;

    return (
        <div className="mb-1">
            <div className={`flex items-center w-full group rounded-sm select-none ${active ? 'bg-blue-600/20 text-blue-200' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}>
                <button
                    onClick={() => {
                        if (isLeaf && onClick) {
                            onClick();
                        } else {
                            setIsOpen(!isOpen);
                        }
                    }}
                    className="flex-1 flex items-center px-2 py-1 text-xs text-inherit"
                >
                    {!isLeaf ? (
                        isOpen ? <ChevronDown size={14} className="mr-1 text-zinc-600" /> : <ChevronRight size={14} className="mr-1 text-zinc-600" />
                    ) : <span className="w-4 mr-1" />}

                    {Icon && <Icon size={14} className="mr-2 text-zinc-500" />}
                    <span className="truncate">{label}</span>
                </button>
                {action && (
                    <div className="opacity-0 group-hover:opacity-100 px-1">
                        {action}
                    </div>
                )}
            </div>
            {isOpen && children && (
                <div className="pl-4 ml-2 border-l border-zinc-800/50">
                    {children}
                </div>
            )}
        </div>
    );
};

const ExplorerPage: React.FC = () => {
    const { projectName, projectPath } = useProject();
    const navigate = useNavigate();

    // Editor State (Migrated from ProjectView)
    const { setStatus } = useOutletContext<any>() || {};
    const [activeTab, setActiveTab] = useState<'workspace' | 'packages' | 'console' | 'config' | 'plugins'>('workspace');
    const [eventFiles, setEventFiles] = useState<string[]>([]);
    const [commandFiles, setCommandFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [botStatus, setBotStatus] = useState<'stopped' | 'running'>('stopped');
    const [isRunConfigOpen, setIsRunConfigOpen] = useState(false);

    // Listen for bot status
    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onBotStatus((status: 'running' | 'stopped') => {
                setBotStatus(status);
            });
        }
    }, []);

    // Load files when project changes
    useEffect(() => {
        if (projectPath) {
            PluginManager.init(projectPath);
            loadFiles();
        }
    }, [projectPath]);

    const handleRunBot = async (secrets?: Record<string, string>) => {
        if (!projectPath) return;

        // If secrets not passed, try to get from storage
        let env = secrets;
        if (!env) {
            const stored = localStorage.getItem('railgun_secrets');
            if (stored) {
                try {
                    env = JSON.parse(stored);
                } catch { }
            }
        }

        // If still no tokens, open dialog
        if (!env || !env.DISCORD_TOKEN) {
            setIsRunConfigOpen(true);
            return;
        }

        if (window.electronAPI) {
            const result = await window.electronAPI.invoke('bot:start', projectPath, env);
            if (result.success) {
                setStatus?.('Bot Started');
            } else {
                alert(`Failed to start bot: ${result.error}`);
            }
        }
    };

    const handleStopBot = async () => {
        if (window.electronAPI) {
            await window.electronAPI.invoke('bot:stop');
            setStatus?.('Bot Stopped');
        }
    };

    const loadFiles = async () => {
        if (!projectPath) return;
        try {
            // @ts-ignore
            const eFiles = await window.electronAPI.listFiles(projectPath, 'events');
            if (eFiles) {
                const filtered = eFiles.filter((f: string) => f.endsWith('.railgun.json'));
                setEventFiles(filtered);
            }

            // @ts-ignore
            const cFiles = await window.electronAPI.listFiles(projectPath, 'commands');
            if (cFiles) {
                const filtered = cFiles.filter((f: string) => f.endsWith('.railgun.json'));
                setCommandFiles(filtered);
            }
        } catch (error) {
            console.error("Failed to load files", error);
        }
    };

    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
    const [isCreateCommandModalOpen, setIsCreateCommandModalOpen] = useState(false);

    const handleOpenCreateEventModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCreateEventModalOpen(true);
    };

    const handleOpenCreateCommandModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsCreateCommandModalOpen(true);
    };

    const handleCreateEvent = async (name: string, type: string) => {
        if (!projectPath) return;

        const fileName = name.endsWith('.railgun.json') ? name : `${name}.railgun.json`;
        const filePath = `events/${fileName}`;

        let defaultContent;
        try {
            defaultContent = eventRegistry.generateContent(type, "event@" + Date.now());
        } catch (e) {
            console.error(e);
            alert("Failed to generate event content: " + e);
            return;
        }

        try {
            // @ts-ignore
            await window.electronAPI.saveFile(projectPath, filePath, JSON.stringify(defaultContent, null, 2));
            await loadFiles();
            setSelectedFile(`events/${fileName}`);
            setActiveTab('workspace');
        } catch (err) {
            console.error("Failed to create file", err);
            alert("Failed to create file");
        }
    };

    const handleCreateCommand = async (name: string, args: string[] = []) => {
        if (!projectPath) return;

        const fileName = name.endsWith('.railgun.json') ? name : `${name}.railgun.json`;
        const filePath = `commands/${fileName}`;

        let defaultContent;
        try {
            defaultContent = commandRegistry.generateContent('legacyCommand', "command@" + Date.now(), args);
        } catch (e) {
            console.error(e);
            alert("Failed to generate command content: " + e);
            return;
        }

        try {
            // @ts-ignore
            await window.electronAPI.saveFile(projectPath, filePath, JSON.stringify(defaultContent, null, 2));
            await loadFiles();
            setSelectedFile(`commands/${fileName}`);
            setActiveTab('workspace');
        } catch (err) {
            console.error("Failed to create command file", err);
            alert("Failed to create command file");
        }
    };

    const handleFileClick = (file: string) => {
        setSelectedFile(file);
        setActiveTab('workspace');
    };

    const handleDeleteFile = async (filePath: string) => {
        if (!confirm(`Are you sure you want to delete ${filePath}?`)) return;

        // @ts-ignore
        const success = await window.electronAPI.deleteFile(projectPath, filePath);
        if (success) {
            if (selectedFile === filePath) setSelectedFile(null);
            loadFiles();
        } else {
            alert("Failed to delete file");
        }
    };


    // EMPTY STATE (No Project Open)
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

    // MAIN IDE VIEW (Project Open)
    return (
        <div className="flex h-full bg-background animate-in fade-in zoom-in-95 duration-200">
            {/* Sidebar / File Tree */}
            <div className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
                <div className="h-12 flex items-center px-4 border-b border-zinc-800 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-2 h-7 w-7 text-zinc-500 hover:text-white" title="Back to Dashboard">
                        <ArrowLeft size={16} />
                    </Button>
                    <div className="min-w-0">
                        <div className="font-semibold text-sm truncate text-zinc-200 mt-1">{projectName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono truncate">{projectPath}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-2 space-y-4">
                    <div className="px-2">
                        <h3 className="text-[10px] uppercase font-bold text-zinc-600 mb-2">Behaviors</h3>

                        <TreeItem
                            label="Commands"
                            icon={TerminalIcon}
                            action={
                                <button onClick={handleOpenCreateCommandModal} className="hover:bg-zinc-700 p-0.5 rounded text-zinc-400 hover:text-white">
                                    <Plus size={12} />
                                </button>
                            }
                        >
                            {commandFiles.length === 0 && (
                                <div className="text-xs text-zinc-600 italic px-2 py-1">No commands found</div>
                            )}
                            {commandFiles.map(file => (
                                <TreeItem
                                    key={file}
                                    label={file.replace('.railgun.json', '')}
                                    icon={FileCode}
                                    active={selectedFile === `commands/${file}`}
                                    onClick={() => handleFileClick(`commands/${file}`)}
                                    action={
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFile(`commands/${file}`);
                                            }}
                                            className="text-zinc-500 hover:text-red-400 p-1 rounded"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    }
                                />
                            ))}
                        </TreeItem>

                        <div className="mt-2" />
                        <TreeItem label="Slash Commands" icon={TerminalIcon}>
                            <TreeItem label="/ ping" />
                            <TreeItem label="/ help" />
                            <TreeItem label="/ ban" />
                        </TreeItem>

                        <div className="mt-2" />
                        <TreeItem
                            label="Events"
                            icon={Zap}
                            action={
                                <button onClick={handleOpenCreateEventModal} className="hover:bg-zinc-700 p-0.5 rounded text-zinc-400 hover:text-white">
                                    <Plus size={12} />
                                </button>
                            }
                        >
                            {eventFiles.length === 0 && (
                                <div className="text-xs text-zinc-600 italic px-2 py-1">No events found</div>
                            )}
                            {eventFiles.map(file => (
                                <TreeItem
                                    key={file}
                                    label={file.replace('.railgun.json', '')}
                                    icon={FileCode}
                                    active={selectedFile === `events/${file}`}
                                    onClick={() => handleFileClick(`events/${file}`)}
                                    action={
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteFile(`events/${file}`);
                                            }}
                                            className="text-zinc-500 hover:text-red-400 p-1 rounded"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    }
                                />
                            ))}
                        </TreeItem>
                    </div>

                    <div className="px-2 border-t border-zinc-800/50 pt-4">
                        <h3 className="text-[10px] uppercase font-bold text-zinc-600 mb-2">Global State</h3>
                        <TreeItem label="Variables" icon={Variable}>
                            <TreeItem label="xp_rate (Number)" />
                            <TreeItem label="welcome_msg (String)" />
                        </TreeItem>
                        <div className="mt-2" />
                        <TreeItem label="Database" icon={Database}>
                            <TreeItem label="Users Table" />
                            <TreeItem label="Inventory Table" />
                        </TreeItem>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* Tabs Header */}
                <div className="h-12 flex items-center border-b border-zinc-800 bg-zinc-900/50">
                    <TabButton
                        active={activeTab === 'workspace'}
                        onClick={() => setActiveTab('workspace')}
                        icon={Layout}
                    >
                        Blueprint
                    </TabButton>
                    <TabButton
                        active={activeTab === 'config'}
                        icon={Settings}
                        onClick={() => setActiveTab('config')}
                    >
                        Config
                    </TabButton>
                    <TabButton
                        active={activeTab === 'packages'}
                        icon={Package}
                        onClick={() => setActiveTab('packages')}
                    >
                        Packages
                    </TabButton>
                    <TabButton
                        active={activeTab === 'plugins'}
                        icon={Plug}
                        onClick={() => setActiveTab('plugins')}
                    >
                        Plugins
                    </TabButton>
                    <TabButton
                        active={activeTab === 'console'}
                        onClick={() => setActiveTab('console')}
                        icon={TerminalIcon}
                    >
                        Console
                    </TabButton>
                </div>

                {/* Run Controls */}
                <div className="flex items-center gap-2 px-4 h-12 border-b border-zinc-800 bg-zinc-900/50">
                    <button
                        onClick={() => setIsRunConfigOpen(true)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                        title="Run Configuration"
                    >
                        <FileKey size={16} />
                    </button>
                    <div className="h-4 w-px bg-zinc-800 mx-1" />

                    {botStatus === 'stopped' ? (
                        <button
                            onClick={() => handleRunBot()}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-medium transition-colors"
                        >
                            <Play size={14} fill="currentColor" />
                            <span>Run Bot</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleStopBot}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium transition-colors"
                        >
                            <Square size={14} fill="currentColor" />
                            <span>Stop Bot</span>
                        </button>
                    )}
                </div>

                {/* Content Viewport */}
                <div className="flex-1 relative overflow-hidden">
                    <div className={`absolute inset-0 ${activeTab === 'console' ? 'block' : 'hidden'}`}>
                        <ConsoleTab
                            isActive={activeTab === 'console'}
                            projectName={projectName!}
                            projectPath={projectPath!}
                            autoInstall={false} // Todo: Pass correct autoinstall state
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
                onCreateEvent={handleCreateEvent}
            />
            <CreateCommandModal
                open={isCreateCommandModalOpen}
                onOpenChange={setIsCreateCommandModalOpen}
                onCreateCommand={handleCreateCommand}
            />

            <RunConfigDialog
                open={isRunConfigOpen}
                onOpenChange={setIsRunConfigOpen}
            />
        </div>
    );
};

export default ExplorerPage;
