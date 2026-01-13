import React from 'react';
import { ModalBuilder } from '@/components/ui/modal-builder/ModalBuilder';
import { type ModalSchema } from '@/lib/modal-builder/types';

export interface SlashOption {
    name: string;
    description: string;
    type: 'STRING' | 'INTEGER' | 'BOOLEAN' | 'USER' | 'CHANNEL' | 'ROLE' | 'MENTIONABLE' | 'NUMBER' | 'ATTACHMENT';
    required: boolean;
}

interface CreateSlashCommandModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateCommand: (name: string, description: string, options: SlashOption[]) => void;
}

const SCHEMA: ModalSchema = {
    id: 'create-slash-command',
    title: 'Create New Slash Command',
    submitLabel: 'Create Command',
    size: 'lg',
    fields: [
        {
            id: 'name',
            label: 'Command Name',
            type: 'text',
            required: true,
            placeholder: 'my-command',
            description: 'Lowercase, no spaces (kebab-case).'
        },
        {
            id: 'description',
            label: 'Description',
            type: 'text',
            required: true,
            placeholder: 'What does this command do?'
        },
        {
            id: 'options',
            label: 'Command Options (Arguments)',
            type: 'slash-options',
            description: 'Define input arguments for your slash command.'
        }
    ]
};

export function CreateSlashCommandModal({ open, onOpenChange, onCreateCommand }: CreateSlashCommandModalProps) {
    const handleCreate = (data: { name: string; description: string; options: SlashOption[] }) => {
        onCreateCommand(
            data.name.toLowerCase().replace(/\s+/g, '-'),
            data.description,
            data.options || []
        );
    };

    return (
        <ModalBuilder
            schema={SCHEMA}
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={handleCreate}
            initialData={{
                name: '',
                description: '',
                options: []
            }}
        />
    );
}
