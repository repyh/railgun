import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createCallFunctionNode() {
    const node = new BotNode('Call Function', 'Function');

    // Inputs
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('fn', new ClassicPreset.Input(Sockets.Function, 'Function'));

    // Arguments
    node.addInput('arg0', new ClassicPreset.Input(Sockets.Any, 'Arg 0'));
    node.addInput('arg1', new ClassicPreset.Input(Sockets.Any, 'Arg 1'));
    node.addInput('arg2', new ClassicPreset.Input(Sockets.Any, 'Arg 2'));

    // Outputs
    node.addOutput('exec_out', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
    node.addOutput('result', new ClassicPreset.Output(Sockets.Any, 'Result'));

    return node;
}
