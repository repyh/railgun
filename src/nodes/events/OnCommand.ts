import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createOnCommandNode(): BotNode {
    const node = new BotNode('On Command', 'Event');

    // Outputs
    node.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
    node.addOutput('message', new ClassicPreset.Output(Sockets.Any, 'Message')); // Message object (will be treated as any/obj in compiler)
    node.addOutput('args', new ClassicPreset.Output(Sockets.Any, 'Args'));    // Args array

    // Controls
    node.addControl('name', new InputControl('', 'Command Name'));

    return node;
}
