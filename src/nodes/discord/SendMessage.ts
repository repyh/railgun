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

    public validate(connections: any[]): { id: string, message: string, severity: 'error' | 'warning' }[] {
        const issues: { id: string, message: string, severity: 'error' | 'warning' }[] = [];

        // Custom Logic: Content OR Embed required
        const hasContentConn = connections.some((c: any) => c.target === this.id && c.targetInput === 'content');
        // @ts-ignore - access control value safely
        const contentValue = this.controls?.content?.value;
        const hasContent = hasContentConn || (contentValue && contentValue.trim() !== '');

        const hasEmbeds = connections.some((c: any) => c.target === this.id && c.targetInput === 'embeds');

        if (!hasContent && !hasEmbeds) {
            issues.push({
                id: `${this.id}-req-content`,
                message: 'Send Message requires Content, an Embed, or Files.',
                severity: 'warning'
            });
        }

        // Target is standard required, we could use requireInput for it, or check here.
        // Let's use metadata for target in the constructor if we can, 
        // OR just simple check here.
        const hasTarget = connections.some((c: any) => c.target === this.id && c.targetInput === 'target');
        if (!hasTarget) {
            issues.push({
                id: `${this.id}-req-target`,
                message: 'Send Message requires a Target (Channel/Interaction).',
                severity: 'warning'
            });
        }

        return issues;
    }
}

export function createSendMessageNode() {
    return new SendMessageNode();
}
