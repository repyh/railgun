import type { NodeSchema } from '@/lib/railgun-flow';

export const FunctionDefSchema: NodeSchema = {
    id: 'functions/def',
    label: 'Define Function',
    category: 'Functions',
    description: 'Creates a reusable block of logic.',
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Body', socketType: 'Exec' },
        { key: 'arg1', label: 'Arg 1', socketType: 'Any' },
        { key: 'arg2', label: 'Arg 2', socketType: 'Any' }
    ],
    controls: [
        { key: 'funcName', label: 'Function Name', type: 'text', props: { defaultValue: 'myFunction' } }
    ]
};
