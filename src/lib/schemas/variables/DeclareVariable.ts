import type { NodeSchema } from '@/lib/railgun-flow';

export const DeclareVariableSchema: NodeSchema = {
    id: 'variables/declare',
    label: 'Declare Variable',
    category: 'Variables',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'value', label: 'Initial Value', socketType: 'Any' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Exec', socketType: 'Exec' },
        { key: 'variable', label: 'Variable', socketType: 'Any' }
    ],
    controls: [
        { key: 'varName', label: 'Variable Name', type: 'text', props: { defaultValue: '' } }
    ]
};
