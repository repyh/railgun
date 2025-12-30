import type { EventDefinition } from './EventDefinition';

export const ClientReadyEvent: EventDefinition = {
    id: 'ready',
    label: 'ready',
    description: 'Triggered when the bot successfully logs in and is ready.',
    nodeLabel: 'On Ready',
    defaultContent: (_id: string) => ({
        id: `event@${Date.now()}`,
        nodes: [
            {
                id: "root",
                label: "On Ready",
                category: "Event",
                inputs: {},
                outputs: {
                    exec: { socket: { name: "Exec" } },
                    client: { socket: { name: "Client" } }
                }
            }
        ],
        connections: []
    })
};
