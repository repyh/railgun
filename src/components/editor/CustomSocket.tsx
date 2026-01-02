import { getSocketConfig } from '@/lib/railgun-rete';
import { Play } from 'lucide-react';

export function CustomSocket(props: { data: any }) {
    const { data } = props; // data is the Socket instance (name, etc.)
    const name = data.name;

    const config = getSocketConfig(name);
    const isExec = config.category === 'exec';

    return (
        <div
            className="w-4 h-4 flex items-center justify-center cursor-crosshair hover:scale-125 transition-transform"
            title={name}
        >
            {isExec ? (
                // Exec socket: Play Icon
                <Play className="w-3 h-3 text-white fill-white" />
            ) : (
                // Data socket: Circle/Square
                <div className={`w-2.5 h-2.5 border border-black rounded-full ${config.color}`} />
            )}
        </div>
    );
}

