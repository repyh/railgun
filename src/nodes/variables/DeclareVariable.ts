import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createDeclareVariableNode() {
    const node = new BotNode('Declare Variable', 'Action'); // Grouping under Action for now, or Variable

    // Execution Inputs/Outputs
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addOutput('exec_out', new ClassicPreset.Output(Sockets.Exec, 'Exec'));

    // Data Inputs/Controls
    node.addInput('value', new ClassicPreset.Input(Sockets.Any, 'Initial Value'));
    node.addControl('varName', new InputControl('', 'Variable Name', 'text'));
    node.addOutput('variable', new ClassicPreset.Output(Sockets.Any, 'Variable'));

    return node;
}
