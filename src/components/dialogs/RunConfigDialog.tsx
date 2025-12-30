import { useState, useEffect } from 'react';

// import { Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface RunConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RunConfigDialog({ open, onOpenChange }: RunConfigDialogProps) {
    const [token, setToken] = useState('');
    const [clientId, setClientId] = useState('');
    const [guildId, setGuildId] = useState('');

    useEffect(() => {
        if (open) {
            const stored = localStorage.getItem('railgun_secrets');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setToken(parsed.DISCORD_TOKEN || '');
                    setClientId(parsed.CLIENT_ID || '');
                    setGuildId(parsed.GUILD_ID || '');
                } catch (e) {
                    console.error('Failed to parse secrets', e);
                }
            }
        }
    }, [open]);

    const handleSave = () => {
        const secrets = {
            DISCORD_TOKEN: token,
            CLIENT_ID: clientId,
            GUILD_ID: guildId,
        };
        localStorage.setItem('railgun_secrets', JSON.stringify(secrets));
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Run Configuration</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 px-6">
                    <div className="grid gap-2">
                        <Label htmlFor="token">Discord Token</Label>
                        <Input
                            id="token"
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="MTA..."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="clientId">Client ID</Label>
                        <Input
                            id="clientId"
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="123456789..."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="guildId">Dev Guild ID (Optional)</Label>
                        <Input
                            id="guildId"
                            type="text"
                            value={guildId}
                            onChange={(e) => setGuildId(e.target.value)}
                            placeholder="123456789..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
