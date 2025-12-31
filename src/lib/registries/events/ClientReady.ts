import type { EventDefinition } from './EventDefinition';

export const ClientReadyEvent: EventDefinition = {
    id: 'clientReady',
    label: 'clientReady',
    description: 'Triggered when the bot successfully logs in and is ready.',
    nodeLabel: 'On Client Ready',
    defaultContent: (name: string, _id: string) => ({
        id: `event@${Date.now()}`,
        nodes: [
            {
                id: "root",
                label: name || "On Client Ready",
                data: { eventType: 'clientReady', nodeType: 'On Ready' },
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
