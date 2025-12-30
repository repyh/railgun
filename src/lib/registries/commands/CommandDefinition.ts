export interface CommandDefinition {
    id: string;
    label: string;
    description?: string;
    nodeLabel: string;
    defaultContent: (id: string, args?: any[]) => any;
}
