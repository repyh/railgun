import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createFunctionDefNode() {
    const node = new BotNode('Function Def', 'Function');
    // Controls
    node.addControl('name', new InputControl('myFunc', 'Function Name', 'text'));

    // Outputs
    node.addOutput('fn', new ClassicPreset.Output(Sockets.Function, 'Ref'));

    node.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Body'));

    node.addOutput('arg0', new ClassicPreset.Output(Sockets.Any, 'Arg 0'));
    node.addOutput('arg1', new ClassicPreset.Output(Sockets.Any, 'Arg 1'));
    node.addOutput('arg2', new ClassicPreset.Output(Sockets.Any, 'Arg 2'));
    node.addOutput('ret', new ClassicPreset.Output(Sockets.Any, 'Return Var'));

    return node;
}
