import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createForLoopNode() {
    const node = new BotNode('For Loop', 'Logic');
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));

    const startInput = new ClassicPreset.Input(Sockets.Number, 'Start Index');
    node.addInput('start', startInput);

    const endInput = new ClassicPreset.Input(Sockets.Number, 'End Index');
    node.addInput('end', endInput);

    node.addInput('updateFunc', new ClassicPreset.Input(Sockets.Function, 'Update Logic (Func)'));

    node.addOutput('completed', new ClassicPreset.Output(Sockets.Exec, 'Completed'));
    node.addOutput('body', new ClassicPreset.Output(Sockets.Exec, 'Loop Body'));
    node.addOutput('index', new ClassicPreset.Output(Sockets.Number, 'Index'));
    return node;
}
