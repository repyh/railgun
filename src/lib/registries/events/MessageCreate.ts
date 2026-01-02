import type { EventDefinition } from './EventDefinition';

export const MessageCreateEvent: EventDefinition = {
    id: 'messageCreate',
    label: 'messageCreate',
    description: 'Triggered when a message is sent in a guild or DM.',
    nodeLabel: 'On Message Create',
    defaultContent: () => ({
        nodes: [
            {
                id: "root",
                type: 'universal',
                position: { x: 100, y: 100 },
                data: { _schemaId: 'event/on-message-create' }
            }
        ],
        edges: []
    })
};
