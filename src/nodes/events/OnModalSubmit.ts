import { ClassicPreset } from 'rete';
import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';

export class OnModalSubmitNode extends BotNode {
    constructor() {
        super('On Modal Submit', 'Event');

        this.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
        this.addOutput('interaction', new ClassicPreset.Output(Sockets.Any, 'Interaction'));

        this.addOutput('fields', new ClassicPreset.Output(Sockets.Any, 'Fields'));

        this.addControl('customId', new InputControl('', 'Match Custom ID'));
    }
}

export function createOnModalSubmitNode() {
    return new OnModalSubmitNode();
}
