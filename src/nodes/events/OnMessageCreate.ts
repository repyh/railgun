import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createOnMessageCreateNode() {
    const node = new BotNode('On Message Create', 'Event');
    node.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
    node.addOutput('user', new ClassicPreset.Output(Sockets.Any, 'User'));
    node.addOutput('channel', new ClassicPreset.Output(Sockets.Any, 'Channel'));
    return node;
}
