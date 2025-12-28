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
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { useProject } from '@/contexts/ProjectContext';

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
        className="group flex flex-col items-start p-4 border border-border rounded-md bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all text-left w-full h-full select-none"
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

const RecentItem = ({ name, path, time }: { name: string, path: string, time: string }) => (
    <div className="flex items-center justify-between p-2.5 rounded-sm hover:bg-zinc-800/50 group cursor-pointer border border-transparent hover:border-zinc-800/50 border-b-zinc-800/30">
        <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-300 font-medium truncate group-hover:text-blue-400 transition-colors">{name}</span>
                {/* <span className="text-[10px] uppercase tracking-wider text-zinc-600 border border-zinc-800 px-1 rounded">Bot</span> */}
            </div>
            <span className="text-xs text-zinc-600 truncate font-mono">{path}</span>
        </div>
        <span className="text-xs text-zinc-600 shrink-0">{time}</span>
    </div>
);

export const DashboardView: React.FC = () => {
    const [nodeVersion, setNodeVersion] = React.useState('Unknown');
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const navigate = useNavigate();
    const { setProject } = useProject();

    React.useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.invoke('system:getNodeVersion')
                .then(setNodeVersion)
                .catch(() => setNodeVersion('Error'));
        }
    }, []);

    const handleOpenProject = async () => {
        if (window.electronAPI) {
            try {
                const result = await window.electronAPI.openProject();
                if (!result.canceled && result.path) {
                    // Navigate to project view with state
                    // name is optional from IPC, fallback to path name
                    const name = result.name || result.path.split(/[\\/]/).pop();
                    //@ts-ignore
                    setProject(result.path, name);
                    navigate('/project', {
                        state: {
                            name: name,
                            path: result.path,
                            autoInstall: false // Existing projects don't need auto-install usually
                        }
                    });
                } else if (result.error) {
                    alert(result.error);
                }
            } catch (error) {
                console.error('Failed to open project:', error);
            }
        }
    };

    const handleProjectCreated = (name: string, path: string) => {
        const fullPath = `${path}\\${name}`;

        setProject(fullPath, name);
        navigate('/project', {
            state: {
                name,
                path: fullPath,
                autoInstall: true
            }
        });
    };

    return (
        <div className="flex h-full w-full bg-[#09090b]">
            {/* Main Area */}
            <div className="flex-1 p-12 overflow-auto mx-auto max-w-7xl">
                <CreateProjectModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onCreateProject={handleProjectCreated}
                />

                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2 py-2">Railgun</h1>
                    <p className="text-zinc-400 text-lg">Visual Discord Bot Editor. v0.0.1-alpha</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <ActionCard
                        icon={Plus}
                        title="New Project"
                        shortcut="Ctrl+N"
                        description="Create a new bot from scratch or template."
                        onClick={() => setIsCreateModalOpen(true)}
                    />
                    <ActionCard
                        icon={FolderOpen}
                        title="Open Project"
                        shortcut="Ctrl+O"
                        description="Open an existing bot project from disk."
                        onClick={handleOpenProject}
                    />
                    {/* Clone from Git removed as requested */}
                    <ActionCard
                        icon={BookOpen}
                        title="Documentation"
                        description="Learn how to use the editor."
                    />
                </div>

                <CreateProjectModal
                    open={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onCreateProject={handleProjectCreated}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Recent Projects */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                            <h2 className="text-lg font-light flex items-center gap-2 text-zinc-100">
                                <Clock size={16} className="text-zinc-500" />
                                Recent Projects
                            </h2>
                            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View All <ArrowRight size={12} /></button>
                        </div>

                        <div className="flex flex-col gap-1">
                            <RecentItem name="ModerationBot" path="~/documents/bots/mod-bot" time="2 hours ago" />
                            <RecentItem name="MusicPlayer" path="~/dev/discord/music-v2" time="Yesterday" />
                            <RecentItem name="EconomySystem" path="~/work/freelance/eco-bot" time="3 days ago" />
                            <RecentItem name="TestBot_v4" path="~/tmp/testing/v4" time="Last week" />
                        </div>

                        <div className="mt-8 p-4 rounded-md border border-dashed border-zinc-800 bg-zinc-900/20 text-center text-zinc-500 text-sm">
                            No more recent projects found.
                        </div>
                    </div>

                    {/* System / News */}
                    <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                            <h2 className="text-lg font-light flex items-center gap-2 text-zinc-100">
                                <Cpu size={16} className="text-zinc-500" />
                                System Status
                            </h2>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="p-4 rounded-md bg-zinc-900 border border-zinc-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-zinc-400">Node Runtime</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${nodeVersion !== 'Error' && nodeVersion !== 'Unknown' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-sm text-zinc-300">{nodeVersion} (Node)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
