import type { NodeSchema } from '@/lib/railgun-flow';

export const DeclareVariableSchema: NodeSchema = {
    id: 'variables/declare-variable',
    label: 'Declare Variable',
    category: 'Variables',
    description: 'Initializes a new local variable.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'initialValue', label: 'Initial Value', socketType: 'Any' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        { key: 'varName', label: 'Variable Name', type: 'text', props: { defaultValue: 'myVar' } }
    ]
};
