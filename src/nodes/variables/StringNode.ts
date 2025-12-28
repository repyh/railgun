import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createStringNode() {
    const node = new BotNode('String', 'Variable');
    node.addControl('value', new InputControl('', 'Value', 'text'));
    node.addOutput('output', new ClassicPreset.Output(Sockets.String, 'Value'));
    return node;
}
