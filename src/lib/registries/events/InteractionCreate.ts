import type { EventDefinition } from './EventDefinition';

export const InteractionCreateEvent: EventDefinition = {
    id: 'interactionCreate',
    label: 'interactionCreate',
    description: 'Triggered when a user uses a slash command.',
    nodeLabel: 'On Slash Command',
    defaultContent: (name: string, _id: string) => ({
        nodes: [
            {
                id: "root",
                type: 'universal',
                position: { x: 100, y: 100 },
                data: { _schemaId: 'event/slash-command', name: name }
            }
        ],
        edges: []
    })
};
