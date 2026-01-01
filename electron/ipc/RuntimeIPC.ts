import { BaseIPC } from './BaseIPC';
import { RuntimeManager } from '../lib/RuntimeManager';

export class RuntimeIPC extends BaseIPC {
    private runtimeManager = RuntimeManager.getInstance();

    getName(): string {
        return 'runtime';
    }

    async checkAll() {
        const [node, bun] = await Promise.all([
            this.runtimeManager.checkNode(),
            this.runtimeManager.checkBun()
        ]);
        return { node, bun };
    }

    async installBun() {
        return await this.runtimeManager.installBun();
    }
}
