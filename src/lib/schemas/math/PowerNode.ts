import type { NodeSchema } from '@/lib/railgun-flow';

export const PowerSchema: NodeSchema = {
    id: 'math/power',
    label: 'Power',
    category: 'Math',
    inputs: [
        { key: 'base', label: 'Base', socketType: 'Number' },
        { key: 'exponent', label: 'Exponent', socketType: 'Number' }
    ],
    outputs: [
        { key: 'result', label: 'Result', socketType: 'Number' }
    ],
    controls: []
};
