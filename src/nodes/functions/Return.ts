import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createReturnNode() {
    const node = new BotNode('Return', 'Function');

    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('value', new ClassicPreset.Input(Sockets.Any, 'Value'));

    return node;
}
