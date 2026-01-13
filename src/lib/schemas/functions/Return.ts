import type { NodeSchema } from '@/lib/railgun-flow';

export const ReturnSchema: NodeSchema = {
    id: 'functions/return',
    label: 'Return',
    category: 'Functions',
    description: 'Exits a function with a value.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'value', label: 'Value', socketType: 'Any' }
    ],
    outputs: [],
    controls: []
};
