import type { NodeSchema } from '@/lib/railgun-flow';

export const CallFunctionSchema: NodeSchema = {
    id: 'functions/call',
    label: 'Call Function',
    category: 'Functions',
    description: 'Executes a defined function.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'arg1', label: 'Arg 1', socketType: 'Any' },
        { key: 'arg2', label: 'Arg 2', socketType: 'Any' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Then', socketType: 'Exec' },
        { key: 'result', label: 'Result', socketType: 'Any' }
    ],
    controls: [
        { key: 'funcName', label: 'Function Name', type: 'text' }
    ]
};
