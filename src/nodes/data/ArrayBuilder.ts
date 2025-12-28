import { ClassicPreset } from 'rete';
import { BotNode, Sockets } from '@/lib/railgun-rete';

export class ArrayBuilderNode extends BotNode {
    constructor() {
        super('Array Builder', 'Data');

        // Initial fixed inputs
        this.addInput('item1', new ClassicPreset.Input(Sockets.Any, 'Item 1'));
        this.addInput('item2', new ClassicPreset.Input(Sockets.Any, 'Item 2'));
        this.addInput('item3', new ClassicPreset.Input(Sockets.Any, 'Item 3'));
        this.addInput('item4', new ClassicPreset.Input(Sockets.Any, 'Item 4'));
        this.addInput('item5', new ClassicPreset.Input(Sockets.Any, 'Item 5'));

        // Output
        this.addOutput('array', new ClassicPreset.Output(Sockets.Array, 'Array'));
    }
}

export function createArrayBuilderNode() {
    return new ArrayBuilderNode();
}
