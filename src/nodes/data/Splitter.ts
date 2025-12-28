import { ClassicPreset } from 'rete';
import { BotNode, Sockets } from '@/lib/railgun-rete';

export class SplitterNode extends BotNode {
    constructor() {
        super('Splitter', 'Data');

        // Single Input
        this.addInput('value', new ClassicPreset.Input(Sockets.Any, 'Value'));

        // Multiple Outputs (Copies)
        this.addOutput('out1', new ClassicPreset.Output(Sockets.Any, 'Value 1'));
        this.addOutput('out2', new ClassicPreset.Output(Sockets.Any, 'Value 2'));
        this.addOutput('out3', new ClassicPreset.Output(Sockets.Any, 'Value 3'));
        this.addOutput('out4', new ClassicPreset.Output(Sockets.Any, 'Value 4'));
    }
}

export function createSplitterNode() {
    return new SplitterNode();
}
