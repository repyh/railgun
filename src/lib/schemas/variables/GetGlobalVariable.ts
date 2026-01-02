import type { NodeSchema } from '@/lib/railgun-flow';

export const GetGlobalVariableSchema: NodeSchema = {
    id: 'variables/get-global',
    label: 'Get Global Var',
    category: 'Variables',
    inputs: [],
    outputs: [
        { key: 'value', label: 'Value', socketType: 'Any' }
    ],
    controls: [
        { key: 'varName', label: 'Variable Name', type: 'text', props: { defaultValue: '' } }
    ]
};
