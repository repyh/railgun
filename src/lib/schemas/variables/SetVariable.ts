import type { NodeSchema } from '@/lib/railgun-flow';

export const SetVariableSchema: NodeSchema = {
    id: 'variables/set',
    label: 'Set Variable',
    category: 'Variables',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'variable', label: 'Variable', socketType: 'Any' },
        { key: 'value', label: 'Value', socketType: 'Any' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        { key: 'varName', label: 'Variable Name', type: 'text', props: { defaultValue: '' } }
    ]
};
