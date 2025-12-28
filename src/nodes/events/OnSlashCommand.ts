import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createOnSlashCommandNode() {
    const node = new BotNode('On Slash Command', 'Event');
    node.addOutput('exec_out', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
    node.addOutput('user', new ClassicPreset.Output(Sockets.Any, 'User'));
    node.addOutput('channel', new ClassicPreset.Output(Sockets.Any, 'Channel'));
    return node;
}
