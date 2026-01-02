import type { NodeSchema } from '@/lib/railgun-flow';

export const SplitterSchema: NodeSchema = {
    id: 'data/splitter',
    label: 'Splitter',
    category: 'Data',
    inputs: [
        { key: 'value', label: 'Value', socketType: 'Any' }
    ],
    outputs: [
        { key: 'out1', label: 'Value 1', socketType: 'Any' },
        { key: 'out2', label: 'Value 2', socketType: 'Any' },
        { key: 'out3', label: 'Value 3', socketType: 'Any' },
        { key: 'out4', label: 'Value 4', socketType: 'Any' }
    ],
    controls: []
};
