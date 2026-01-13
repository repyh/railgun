import React, { useMemo } from 'react';
import { ModalBuilder } from '@/components/ui/modal-builder/ModalBuilder';
import { type ModalSchema } from '@/lib/modal-builder/types';
import { eventRegistry } from '@/lib/registries/EventRegistry';

interface CreateEventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateEvent: (name: string, type: string) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ open, onOpenChange, onCreateEvent }) => {
    const eventTypes = eventRegistry.getAll();

    const SCHEMA: ModalSchema = useMemo(() => ({
        id: 'create-event',
        title: 'Create New Event',
        submitLabel: 'Create Event',
        fields: [
            {
                id: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                placeholder: 'e.g. my-event'
            },
            {
                id: 'type',
                label: 'Type',
                type: 'select',
                required: true,
                defaultValue: eventTypes[0]?.id || '',
                options: eventTypes.map(t => ({ label: t.label, value: t.id }))
            }
        ]
    }), [eventTypes]);

    const handleCreate = (data: any) => {
        onCreateEvent(data.name, data.type);
        onOpenChange(false);
    };

    return (
        <ModalBuilder
            schema={SCHEMA}
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={handleCreate}
            initialData={{ name: '', type: eventTypes[0]?.id || '' }}
        />
    );
};
