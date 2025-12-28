import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createBooleanNode() {
    const node = new BotNode('Boolean', 'Variable');
    node.addControl('value', new InputControl('false', 'Value', 'text')); // Using text for now, could be checkbox later
    node.addOutput('output', new ClassicPreset.Output(Sockets.Boolean, 'Value'));
    return node;
}
