import React, { useState, useEffect, useMemo } from 'react';
import { ModalBuilder } from '@/components/ui/modal-builder/ModalBuilder';
import { type ModalSchema } from '@/lib/modal-builder/types';

interface RunConfigModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (secrets: Record<string, string>) => void;
}

export const RunConfigModal: React.FC<RunConfigModalProps> = ({ open, onOpenChange, onSave }) => {
    const [initialData, setInitialData] = useState<Record<string, string>>({
        DISCORD_TOKEN: '',
        CLIENT_ID: '',
        GUILD_ID: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadSecrets = async () => {
            if (open) {
                setIsLoading(true);
                // @ts-ignore
                const storage = window.electronAPI?.storage;
                if (!storage) return;

                try {
                    let secretsStr = await storage.getSecrets();
                    let parsed = null;

                    if (secretsStr) {
                        parsed = JSON.parse(secretsStr);
                    } else {
                        // Migration
                        const legacy = localStorage.getItem('railgun_secrets');
                        if (legacy) {
                            parsed = JSON.parse(legacy);
                            await storage.setSecrets(legacy);
                            console.log("[RunConfigModal] Migrated secrets to file system.");
                        }
                    }

                    if (parsed) {
                        setInitialData({
                            DISCORD_TOKEN: parsed.DISCORD_TOKEN || '',
                            CLIENT_ID: parsed.CLIENT_ID || '',
                            GUILD_ID: parsed.GUILD_ID || ''
                        });
                    }
                } catch (e) {
                    console.error('Failed to load secrets', e);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadSecrets();
    }, [open]);

    const SCHEMA: ModalSchema = useMemo(() => ({
        id: 'run-config',
        title: 'Run Configuration',
        description: 'Configure bot secrets and identifiers.',
        submitLabel: 'Save Configuration',
        fields: [
            {
                id: 'DISCORD_TOKEN',
                label: 'Discord Token',
                type: 'password',
                required: true,
                placeholder: 'Enter your bot token...'
            },
            {
                id: 'CLIENT_ID',
                label: 'Client ID',
                type: 'text',
                required: true,
                placeholder: '123456789...'
            },
            {
                id: 'GUILD_ID',
                label: 'Dev Guild ID (Optional)',
                type: 'text',
                placeholder: '123456789...'
            }
        ]
    }), []);

    const handleSave = async (data: any) => {
        // @ts-ignore
        const storage = window.electronAPI?.storage;
        if (!storage) return;

        try {
            await storage.setSecrets(JSON.stringify(data, null, 2));
            if (onSave) onSave(data);
            onOpenChange(false);
        } catch (e) {
            console.error('Failed to save secrets', e);
            alert('Failed to save configuration');
        }
    };

    return (
        <ModalBuilder
            schema={SCHEMA}
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={handleSave}
            initialData={initialData}
            isLoading={isLoading}
        />
    );
};
