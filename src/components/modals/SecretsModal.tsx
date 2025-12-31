import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Eye, EyeOff } from 'lucide-react';

interface SecretsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (secrets: Record<string, string>) => void;
}

export const SecretsModal: React.FC<SecretsModalProps> = ({ open, onOpenChange, onSave }) => {
    const [token, setToken] = useState('');
    const [appId, setAppId] = useState('');
    const [showToken, setShowToken] = useState(false);

    // Load existing secrets on open
    useEffect(() => {
        if (open) {
            const stored = localStorage.getItem('railgun_secrets');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setToken(parsed.DISCORD_TOKEN || '');
                    setAppId(parsed.APPLICATION_ID || '');
                } catch { }
            }
        }
    }, [open]);

    const handleSave = () => {
        const secrets = {
            DISCORD_TOKEN: token,
            APPLICATION_ID: appId
        };
        // Persist to local storage for now (MVP security)
        localStorage.setItem('railgun_secrets', JSON.stringify(secrets));
        onSave(secrets);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bot Configuration</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 px-6">
                    <div className="grid gap-2">
                        <Label htmlFor="token">Bot Token</Label>
                        <div className="relative">
                            <Input
                                id="token"
                                type={showToken ? 'text' : 'password'}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="pr-10"
                                placeholder="e.g. MTE..."
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
                        <Label htmlFor="appId">Application ID</Label>
                        <Input
                            id="appId"
                            value={appId}
                            onChange={(e) => setAppId(e.target.value)}
                            placeholder="e.g. 123456789..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!token.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        Save & Run
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
