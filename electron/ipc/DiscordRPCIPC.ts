import { ipcMain } from 'electron';
import { Client } from '@xhayper/discord-rpc';

const CLIENT_ID = '704208121459114006'; // Railgun IDE Client ID (Placeholder or Real)

export class DiscordRPCIPC {
    private rpc: Client | null = null;
    private isReady = false;

    register() {
        ipcMain.handle('rpc:update', async (_, presence: any) => {
            if (!this.rpc || !this.isReady) {
                await this.connect();
            }
            if (!this.rpc || !this.isReady || !this.rpc.user) return;

            try {
                // Ensure timestamp is properly handled if passed
                if (presence.startTimestamp) {
                    presence.startTimestamp = new Date(presence.startTimestamp);
                }

                await this.rpc.user.setActivity(presence);
            } catch (err) {
                console.error('Failed to set activity:', err);
                this.isReady = false;
            }
        });

        ipcMain.handle('rpc:status', async (event, enabled: boolean) => {
            if (enabled) {
                await this.connect();
            } else {
                this.destroy();
            }
        });
    }

    private async connect() {
        if (this.rpc) return;

        try {
            this.rpc = new Client({ clientId: CLIENT_ID });

            this.rpc.on('ready', () => {
                this.isReady = true;
                console.log('Discord RPC Connected');
            });

            await this.rpc.login();
        } catch (err) {
            console.error('Discord RPC Connection Failed', err);
            this.rpc = null;
            this.isReady = false;
        }
    }

    private destroy() {
        if (this.rpc) {
            this.rpc.destroy();
            this.rpc = null;
            this.isReady = false;
        }
    }
}
