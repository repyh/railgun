import { useEffect } from 'react';
import { useRuntimeStore } from '@/stores/useRuntimeStore';
import { Loader2, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { useElectron } from '@/hooks/useElectron';

const StatusItem = ({
    label,
    status,
    version,
    message,
    onAction,
    actionLabel,
    isLoading
}: {
    label: string,
    status: 'installed' | 'missing' | 'outdated' | 'unknown',
    version?: string,
    message?: string,
    onAction?: () => void,
    actionLabel?: string,
    isLoading?: boolean
}) => {
    let color = 'bg-zinc-500';
    let icon = null;

    if (status === 'installed') {
        color = 'bg-green-500';
        icon = <CheckCircle2 size={14} className="text-green-500" />;
    } else if (status === 'missing' || status === 'outdated') {
        color = 'bg-red-500';
        icon = <AlertCircle size={14} className="text-red-500" />;
    }

    return (
        <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
                <span className="text-xs text-zinc-400 block mb-1">{label}</span>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-sm text-zinc-300 font-mono">
                        {status === 'installed' ? version : (message || 'Not Found')}
                    </span>
                    {icon && <div className="ml-auto opacity-80">{icon}</div>}
                </div>
            </div>
            {(status === 'missing' || status === 'outdated') && onAction && (
                <button
                    onClick={onAction}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export const SystemStatus = () => {
    const { nodeStatus, bunStatus, isChecking, isInstalling, checkRuntimes, installBun } = useRuntimeStore();
    const { system } = useElectron();

    useEffect(() => {
        checkRuntimes();
    }, []);

    const openNodeDownload = async () => {
        await system.openExternalLink('https://nodejs.org/en/download');
    };

    if (isChecking && !nodeStatus) {
        return (
            <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/50 flex items-center justify-center gap-2 text-zinc-500 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Checking system runtimes...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <StatusItem
                label="Node.js Runtime"
                status={nodeStatus?.status || 'unknown'}
                version={nodeStatus?.version}
                message={nodeStatus?.message}
                onAction={openNodeDownload}
                actionLabel="Download Node.js"
            />
            <StatusItem
                label="Bun Runtime"
                status={bunStatus?.status || 'unknown'}
                version={bunStatus?.version}
                message={bunStatus?.message}
                onAction={installBun}
                actionLabel="Install Bun"
                isLoading={isInstalling}
            />
        </div>
    );
};
