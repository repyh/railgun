import { BotNode, InputControl, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

const OPERATORS = [
    { value: '++', label: 'Increment (++)' },
    { value: '--', label: 'Decrement (--)' },
];

export function createIncrementNode(): BotNode {
    const node = new BotNode('Increment', 'Variable');

    // Inputs
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('variable', new ClassicPreset.Input(Sockets.String, 'Variable Name'));

    // Controls
    const control = new InputControl('++', 'Operator');
    control.options = OPERATORS;
    node.addControl('op', control);

    // Outputs
    node.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));

    return node;
}
