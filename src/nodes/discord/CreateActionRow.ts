import { ClassicPreset } from 'rete';
import { BotNode, Sockets } from '@/lib/railgun-rete';

export class CreateActionRowNode extends BotNode {
    constructor() {
        super('Create Action Row', 'Discord');

        // Initial slots for components
        this.addInput('comp1', new ClassicPreset.Input(Sockets.Component, 'Component 1'));
        this.addInput('comp2', new ClassicPreset.Input(Sockets.Component, 'Component 2'));
        this.addInput('comp3', new ClassicPreset.Input(Sockets.Component, 'Component 3'));
        // TODO: Make dynamic in UI later

        this.addOutput('row', new ClassicPreset.Output(Sockets.ActionRow, 'Action Row'));
    }
}

export function createActionRowNode() {
    return new CreateActionRowNode();
}
