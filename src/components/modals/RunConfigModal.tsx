import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Eye, EyeOff } from 'lucide-react';

interface RunConfigModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (secrets: Record<string, string>) => void;
}

export function RunConfigModal({ open, onOpenChange, onSave }: RunConfigModalProps) {
    const [token, setToken] = useState('');
    const [clientId, setClientId] = useState('');
    const [guildId, setGuildId] = useState('');
    const [showToken, setShowToken] = useState(false);

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
        if (onSave) onSave(secrets);
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
                        <div className="relative">
                            <Input
                                id="token"
                                type={showToken ? 'text' : 'password'}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder=".................................................................."
                                className="pr-10"
                            />
                            <button
                                onClick={() => setShowToken(!showToken)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                            >
                                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
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
