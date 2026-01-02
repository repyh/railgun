import type { EventDefinition } from './EventDefinition';

export const ClientReadyEvent: EventDefinition = {
    id: 'clientReady',
    label: 'clientReady',
    description: 'Triggered when the bot successfully logs in and is ready.',
    nodeLabel: 'On Client Ready',
    defaultContent: () => ({
        nodes: [
            {
                id: "root",
                type: 'universal',
                position: { x: 100, y: 100 },
                data: { _schemaId: 'event/on-ready' }
            }
        ],
        edges: []
    })
};
