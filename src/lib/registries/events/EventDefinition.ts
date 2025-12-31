export interface EventDefinition {
    id: string;
    label: string;
    description?: string;
    nodeLabel: string;
    defaultContent: (name: string, id: string) => any;
}
