import { ClassicPreset } from 'rete';
import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';

export class SendMessageNode extends BotNode {
    constructor() {
        super('Send Message', 'Discord');

        this.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));

        this.addInput('target', new ClassicPreset.Input(Sockets.Any, 'Channel / Interaction'));

        this.addInput('content', new ClassicPreset.Input(Sockets.String, 'Content'));
        this.addInput('embeds', new ClassicPreset.Input(Sockets.Embed, 'Embeds')); // Should ideally be Array, but one for now or Array logic in generator
        this.addInput('components', new ClassicPreset.Input(Sockets.ActionRow, 'Components')); // Action Rows

        this.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));

        this.addControl('content', new InputControl('', 'Content'));
    }
}

export function createSendMessageNode() {
    return new SendMessageNode();
}
