import { ClassicPreset } from 'rete';
import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';

export class KickMemberNode extends BotNode {
    constructor() {
        super('Kick Member', 'Discord');
        this.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
        this.addInput('member', new ClassicPreset.Input(Sockets.Any, 'Member'));
        this.addInput('reason', new ClassicPreset.Input(Sockets.String, 'Reason'));
        this.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
        this.addControl('reason', new InputControl('', 'Reason'));
    }
}

export class BanMemberNode extends BotNode {
    constructor() {
        super('Ban Member', 'Discord');
        this.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
        this.addInput('member', new ClassicPreset.Input(Sockets.Any, 'Member'));
        this.addInput('reason', new ClassicPreset.Input(Sockets.String, 'Reason'));
        this.addInput('deleteDays', new ClassicPreset.Input(Sockets.Number, 'Delete Msg Days'));
        this.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
        this.addControl('reason', new InputControl('', 'Reason'));
        this.addControl('deleteDays', new InputControl('0', 'Delete Msg Days'));
    }
}

export class AddRoleNode extends BotNode {
    constructor() {
        super('Add Role', 'Discord');
        this.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
        this.addInput('member', new ClassicPreset.Input(Sockets.Any, 'Member'));
        this.addInput('role', new ClassicPreset.Input(Sockets.Any, 'Role'));
        this.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
    }
}

export class RemoveRoleNode extends BotNode {
    constructor() {
        super('Remove Role', 'Discord');
        this.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
        this.addInput('member', new ClassicPreset.Input(Sockets.Any, 'Member'));
        this.addInput('role', new ClassicPreset.Input(Sockets.Any, 'Role'));
        this.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
    }
}
