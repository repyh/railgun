import { memo } from 'react';
import { Handle, type HandleProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOCKET_CONFIG } from '@/lib/railgun-flow';

interface CustomHandleProps extends HandleProps {
    socketType: string; // 'Exec', 'String', 'Number', etc.
    label?: string;
}

export const CustomHandle = memo(({ socketType, className, style, ...props }: CustomHandleProps) => {
    const config = SOCKET_CONFIG[socketType] || SOCKET_CONFIG['Any'];
    const isExec = config.category === 'exec';

    return (
        <Handle
            {...props}
            className={cn(
                "z-10 flex items-center justify-center transition-transform hover:scale-125",
                isExec
                    ? "w-4 h-4 bg-transparent! border-0! rounded-none"
                    : "w-2.5 h-2.5 rounded-full border border-black",
                className
            )}
            style={{
                backgroundColor: isExec ? 'transparent' : config.connectionColor,
                ...style
            }}
        >
            {isExec && <Play className="w-3 h-3 text-white fill-white pointer-events-none" />}
        </Handle>
    );
});
