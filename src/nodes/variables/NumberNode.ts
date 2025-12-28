import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createNumberNode() {
    const node = new BotNode('Number', 'Variable');
    node.addControl('value', new InputControl('0', 'Value', 'number'));
    node.addOutput('output', new ClassicPreset.Output(Sockets.Number, 'Value'));
    return node;
}
