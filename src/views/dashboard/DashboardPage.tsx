import React from 'react';
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
    const [nodeVersion, setNodeVersion] = React.useState('Unknown');
    const [recentProjects, setRecentProjects] = React.useState<any[]>([]);
    const navigate = useNavigate();
    const { setProject } = useProject();
    const { openModal } = useModal();

    const fetchRecentProjects = async () => {
        if (window.electronAPI) {
            try {
                const projects = await window.electronAPI.invoke('project:getRecentProjects');
                setRecentProjects(projects || []);
            } catch (err) {
                console.error('Failed to fetch recent projects:', err);
            }
        }
    };

    React.useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.invoke('system:getNodeVersion')
                .then(setNodeVersion)
                .catch(() => setNodeVersion('Error'));
            fetchRecentProjects();
        }
    }, []);

    const handleOpenProject = async () => {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.invoke('project:openProject');
                if (!result.canceled && result.path) {
                    const name = result.name || result.path.split(/[\\/]/).pop();
                    setProject(result.path, name);
                    navigate('/project', { state: { name, path: result.path, autoInstall: false } });
                }
            } catch (error) {
                console.error('Failed to open project:', error);
            }
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
                                recentProjects.map((project) => (
                                    <RecentItem
                                        key={project.path}
                                        name={project.name}
                                        path={project.path}
                                        time={getRelativeTime(project.lastOpened)}
                                        onClick={() => {
                                            setProject(project.path, project.name);
                                            navigate('/project', { state: { name: project.name, path: project.path, autoInstall: false } });
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
                        <div className="p-4 rounded-md bg-zinc-900 border border-zinc-800">
                            <span className="text-xs text-zinc-400 block mb-2">Node Runtime</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${nodeVersion !== 'Error' && nodeVersion !== 'Unknown' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm text-zinc-300">{nodeVersion} (Node)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
