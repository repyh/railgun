import React, { useState } from 'react';
import {
    Files,
    Terminal,
    Plus,
    Trash2,
    ChevronRight,
    ChevronDown,
    FileCode,
    Zap,
    RefreshCw,
    Database
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { TabType } from '@/hooks/useTabManager';

// Internal TreeItem component for the sidebar
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

interface ExplorerSidebarProps {
    projectName: string | null;
    projectPath: string | null;
    commandFiles: string[];
    slashCommandFiles: string[];
    eventFiles: string[];
    projectFiles: string[];
    selectedFile: string | null;
    onFileClick: (file: string) => void;
    onDeleteFile: (file: string) => void;
    onRefresh?: () => void;
    onOpenCreateCommand: (e: React.MouseEvent) => void;
    onOpenCreateSlashCommand: (e: React.MouseEvent) => void;
    onOpenCreateEvent: (e: React.MouseEvent) => void;
    onNavigateBack: () => void;

    // Tab Management
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const ExplorerSidebar: React.FC<ExplorerSidebarProps> = ({
    projectName,
    projectPath,
    commandFiles,
    slashCommandFiles,
    eventFiles,
    projectFiles,
    selectedFile,
    onFileClick,
    onDeleteFile,
    onOpenCreateCommand,
    onOpenCreateSlashCommand,
    onOpenCreateEvent,
    onNavigateBack,
    onRefresh,
    activeTab,
    onTabChange
}) => {
    return (
        <div className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
            <div className="h-12 flex items-center px-4 border-b border-zinc-800 shrink-0">
                <Button variant="ghost" size="icon" onClick={onNavigateBack} className="mr-2 h-7 w-7 text-zinc-500 hover:text-white" title="Back to Dashboard">
                    <Files size={16} />
                </Button>
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate text-zinc-200 mt-1">{projectName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate">{projectPath}</div>
                </div>
                {onRefresh && (
                    <Button variant="ghost" size="icon" onClick={onRefresh} className="h-6 w-6 text-zinc-500 hover:text-white" title="Refresh Files">
                        <RefreshCw size={14} />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-auto p-2 space-y-4">
                {/* Views */}
                {/* Views Section Removed */}

                <div className="px-2">
                    <h3 className="text-[10px] uppercase font-bold text-zinc-600 mb-2">Project Files</h3>
                    {projectFiles.map(file => (
                        <TreeItem
                            key={file}
                            label={file}
                            icon={FileCode}
                            active={activeTab === 'workspace' && selectedFile === file}
                            onClick={() => onFileClick(file)}
                        />
                    ))}

                    <div className="mt-4" />
                    <h3 className="text-[10px] uppercase font-bold text-zinc-600 mb-2">Behaviors</h3>

                    <TreeItem
                        label="Commands"
                        icon={Terminal}
                        action={
                            <button onClick={onOpenCreateCommand} className="hover:bg-zinc-700 p-0.5 rounded text-zinc-400 hover:text-white">
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
                                label={file.replace('.railgun', '')}
                                icon={FileCode}
                                active={activeTab === 'workspace' && selectedFile === `commands/${file}`}
                                onClick={() => onFileClick(`commands/${file}`)}
                                action={
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteFile(`commands/${file}`);
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
                    <TreeItem
                        label="Slash Commands"
                        icon={Terminal}
                        action={
                            <button onClick={onOpenCreateSlashCommand} className="hover:bg-zinc-700 p-0.5 rounded text-zinc-400 hover:text-white">
                                <Plus size={12} />
                            </button>
                        }
                    >
                        {slashCommandFiles.length === 0 && (
                            <div className="text-xs text-zinc-600 italic px-2 py-1">No slash commands found</div>
                        )}
                        {slashCommandFiles.map(file => (
                            <TreeItem
                                key={file}
                                label={file.replace('.railgun', '')}
                                icon={Terminal}
                                active={activeTab === 'workspace' && selectedFile === `slash_commands/${file}`}
                                onClick={() => onFileClick(`slash_commands/${file}`)}
                                action={
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteFile(`slash_commands/${file}`);
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
                    <TreeItem
                        label="Events"
                        icon={Zap}
                        action={
                            <button onClick={onOpenCreateEvent} className="hover:bg-zinc-700 p-0.5 rounded text-zinc-400 hover:text-white">
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
                                label={file.replace('.railgun', '')}
                                icon={FileCode}
                                active={activeTab === 'workspace' && selectedFile === `events/${file}`}
                                onClick={() => onFileClick(`events/${file}`)}
                                action={
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteFile(`events/${file}`);
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

                <div className="px-2">
                    <h3 className="text-[10px] uppercase font-bold text-zinc-600 mb-2">Data</h3>
                    <TreeItem
                        label="Global Variables"
                        icon={Database}
                        active={activeTab === 'variables'}
                        onClick={() => onTabChange('variables')}
                    />
                </div>
            </div>
        </div>
    );
};