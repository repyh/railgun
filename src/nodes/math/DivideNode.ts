import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createDivideNode() {
    const node = new BotNode('Divide', 'Math');
    node.addInput('a', new ClassicPreset.Input(Sockets.Number, 'A'));
    node.addControl('a_val', new InputControl('0', 'A', 'number'));

    node.addInput('b', new ClassicPreset.Input(Sockets.Number, 'B'));
    node.addControl('b_val', new InputControl('1', 'B', 'number')); // Default to 1 to avoid division by zero visual

    node.addOutput('value', new ClassicPreset.Output(Sockets.Number, 'Result'));
    return node;
}
