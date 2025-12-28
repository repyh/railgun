import { BotNode, InputControl, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

const OPERATORS = [
    { value: '+=', label: 'Add (+=)' },
    { value: '-=', label: 'Subtract (-=)' },
    { value: '*=', label: 'Multiply (*=)' },
    { value: '/=', label: 'Divide (/=)' },
    { value: '%=', label: 'Modulus (%=)' },
];

export function createMathAssignmentNode(): BotNode {
    const node = new BotNode('Math Assignment', 'Variable');

    // Inputs
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('variable', new ClassicPreset.Input(Sockets.String, 'Variable Name'));
    node.addInput('value', new ClassicPreset.Input(Sockets.Number, 'Value'));

    // Controls
    const control = new InputControl('+=', 'Operator');
    control.options = OPERATORS;
    node.addControl('op', control);

    // Outputs
    node.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));

    return node;
}
