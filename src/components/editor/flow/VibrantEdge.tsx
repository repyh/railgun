import { memo } from 'react';
import {
    BaseEdge,
    getBezierPath,
    type EdgeProps,
} from '@xyflow/react';

export const VibrantEdge = memo(({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    let strokeColor = '#ffffff';

    if (data?.color) {
        strokeColor = data.color as string;
    }

    return (
        <BaseEdge
            path={edgePath}
            markerEnd={markerEnd}
            style={{
                ...style,
                stroke: strokeColor,
                strokeWidth: 3,
                opacity: 0.8,
                filter: `drop-shadow(0 0 4px ${strokeColor}44)`
            }}
        />
    );
});
