import { Play } from 'lucide-react';

export function CustomSocket(props: { data: any }) {
    const { data } = props; // data is the Socket instance (name, etc.)
    const name = data.name;

    const getSocketColor = (n: string) => {
        if (n === 'Exec' || n === 'Then') return 'bg-white';
        if (n === 'String') return 'bg-yellow-400';
        if (n === 'Number') return 'bg-blue-400';
        if (n === 'Boolean') return 'bg-purple-400';
        return 'bg-zinc-400';
    };

    const isExec = name === 'Exec' || name === 'Then' || name === 'Loop Body' || name === 'Completed' || name === 'else';

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
                <div className={`w-2.5 h-2.5 border border-black rounded-full ${getSocketColor(name)}`} />
            )}
        </div>
    );
}

