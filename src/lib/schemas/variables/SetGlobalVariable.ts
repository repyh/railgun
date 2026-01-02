import type { NodeSchema } from '@/lib/railgun-flow';

export const SetGlobalVariableSchema: NodeSchema = {
    id: 'variables/set-global',
    label: 'Set Global Var',
    category: 'Variables',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'value', label: 'Value', socketType: 'Any' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        { key: 'varName', label: 'Variable Name', type: 'text', props: { defaultValue: '' } }
    ]
};
