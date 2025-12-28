import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createOnReadyNode() {
    const node = new BotNode('On Ready', 'Event');
    node.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
    node.addOutput('client', new ClassicPreset.Output(Sockets.Any, 'Client'));
    return node;
}
