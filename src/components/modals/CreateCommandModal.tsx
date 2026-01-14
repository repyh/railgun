import { ModalBuilder } from '@/components/ui/modal-builder/ModalBuilder';
import { type ModalSchema } from '@/lib/modal-builder/types';

interface CreateCommandModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateCommand: (name: string, args: string[]) => void;
}

const SCHEMA: ModalSchema = {
    id: 'create-command',
    title: 'Create New Legacy Command',
    submitLabel: 'Create Command',
    size: 'md',
    fields: [
        {
            id: 'name',
            label: 'Command Trigger',
            type: 'text',
            required: true,
            placeholder: 'e.g. kick',
            description: 'The word that follows the prefix (e.g. !kick)'
        },
        {
            id: 'args',
            label: 'Command Arguments',
            type: 'dynamic-list',
            itemPlaceholder: 'e.g. target_user',
            description: 'Define arguments in the order they should appear.'
        }
    ]
};

export function CreateCommandModal({ open, onOpenChange, onCreateCommand }: CreateCommandModalProps) {
    const handleSubmit = (data: { name: string; args: string[] }) => {
        onCreateCommand(data.name.trim().toLowerCase(), data.args || []);
    };

    return (
        <ModalBuilder
            schema={SCHEMA}
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit}
        />
    );
}
