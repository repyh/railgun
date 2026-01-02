import { resolveSocketType } from '@/lib/railgun-rete';

export function CustomConnection(props: { data: any, path?: string }) {
    const { path, data } = props;

    if (!path || !data) return null;

    let config = { connectionColor: '#a1a1aa', category: 'data' }; // Default generic

    try {
        const sourceNodeId = data.source;
        const sourceOutputKey = data.sourceOutput;

        if (sourceNodeId && sourceOutputKey) {
            const resolved = resolveSocketType(sourceNodeId, 'output', sourceOutputKey);
            if (resolved) config = resolved as any;
        }
    } catch (err) {
        // Fallback silently during drag/intermediate states
        console.warn("Connection render warn:", err);
    }

    const isExec = config.category === 'exec';

    const style = {
        '--connection-color': config.connectionColor,
        '--stroke-width': isExec ? '3px' : '2px',
        '--hover-stroke-width': isExec ? '4px' : '3px'
    } as React.CSSProperties;

    return (
        <svg data-testid="connection" className="overflow-visible absolute top-0 left-0 pointer-events-none z-0">
            <path d={path} style={style} />
        </svg>
    );
}

// Custom Connection does not work. Keeping this for future needs.
