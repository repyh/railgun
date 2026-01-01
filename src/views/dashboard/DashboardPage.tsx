import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    FolderOpen,
    BookOpen,
    Cpu,
    Clock,
    ArrowRight
} from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useModal } from '@/contexts/ModalContext';
import { useElectron } from '@/hooks/useElectron';
import { SystemStatus } from './SystemStatus';

const ActionCard = ({
    icon: Icon,
    title,
    shortcut,
    description,
    onClick
}: {
    icon: any,
    title: string,
    shortcut?: string,
    description: string,
    onClick?: () => void
}) => (
    <button
        onClick={onClick}
        className="group hover:cursor-pointer flex flex-col items-start p-4 border border-border rounded-md bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all text-left w-full h-full select-none"
    >
        <div className="flex items-center justify-between w-full mb-3">
            <div className="p-2 rounded-md bg-zinc-800 text-zinc-300 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                <Icon size={20} />
            </div>
            {shortcut && <span className="text-xs text-zinc-500 font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{shortcut}</span>}
        </div>
        <h3 className="text-sm font-medium text-zinc-200 mb-1 group-hover:text-white">{title}</h3>
        <p className="text-xs text-zinc-500 group-hover:text-zinc-400">{description}</p>
    </button>
);

const RecentItem = ({ name, path, time, onClick }: { name: string, path: string, time: string, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className="flex items-center justify-between p-2.5 rounded-sm hover:bg-zinc-800/50 group cursor-pointer border border-transparent hover:border-zinc-800/50 border-b-zinc-800/30"
    >
        <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-300 font-medium truncate group-hover:text-blue-400 transition-colors">{name}</span>
            </div>
            <span className="text-xs text-zinc-600 truncate font-mono">{path}</span>
        </div>
        <span className="text-xs text-zinc-600 shrink-0">{time}</span>
    </div>
);

const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString();
};

const DashboardPage: React.FC = () => {
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const navigate = useNavigate();
    const { setProject } = useProject();
    const { isElectron, project } = useElectron();
    const { openModal } = useModal();

    const loadRecent = async () => {
        if (!isElectron) return;
        try {
            const result = await project.getRecent();
            if (result) setRecentProjects(result);
        } catch (e) {
            console.error(e);
        }
    };

    React.useEffect(() => {
        loadRecent();
    }, []);

    const handleOpenProject = async () => {
        if (!isElectron) return;
        try {
            const result = await project.open();
            if (result) {
                setProject(result.path, result.name);
                navigate('/explorer');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex h-full w-full bg-background text-zinc-100">
            <div className="flex-1 p-12 overflow-auto mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-8">
                    <img src="/resources/railgun-logo_full.svg" alt="Railgun" className="h-12 mb-2 w-auto" />
                    <p className="text-zinc-400 text-lg">Visual Discord Bot Editor. v0.0.1-alpha</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <ActionCard icon={Plus} title="New Project" shortcut="Ctrl+N" description="Create a new bot from scratch or template." onClick={() => openModal('create-project')} />
                    <ActionCard icon={FolderOpen} title="Open Project" shortcut="Ctrl+O" description="Open an existing bot project from disk." onClick={handleOpenProject} />
                    <ActionCard icon={BookOpen} title="Documentation" description="Learn how to use the editor." />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                            <h2 className="text-lg font-light flex items-center gap-2 text-zinc-100">
                                <Clock size={16} className="text-zinc-500" />
                                Recent Projects
                            </h2>
                            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View All <ArrowRight size={12} /></button>
                        </div>

                        <div className="flex flex-col gap-1">
                            {recentProjects.length > 0 ? (
                                recentProjects.map((p) => (
                                    <RecentItem
                                        key={p.path}
                                        name={p.name}
                                        path={p.path}
                                        time={getRelativeTime(p.lastOpened)}
                                        onClick={async () => {
                                            if (isElectron) {
                                                const exists = await project.verify(p.path);
                                                if (!exists) {
                                                    const shouldRemove = window.confirm(`Project not found at ${p.path}.\nDo you want to remove it from your recent projects?`);
                                                    if (shouldRemove) {
                                                        await project.removeFromHistory(p.path);
                                                        // Refresh list to show it's gone
                                                        loadRecent();
                                                    }
                                                    return;
                                                }
                                            }
                                            setProject(p.path, p.name);
                                            navigate('/explorer', { state: { name: p.name, path: p.path, autoInstall: false } });
                                        }}
                                    />
                                ))
                            ) : (
                                <div className="mt-8 p-4 rounded-md border border-dashed border-zinc-800 bg-zinc-900/20 text-center text-zinc-500 text-sm">
                                    No more recent projects found.
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                            <h2 className="text-lg font-light flex items-center gap-2 text-zinc-100">
                                <Cpu size={16} className="text-zinc-500" />
                                System Status
                            </h2>
                        </div>
                        <SystemStatus />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
