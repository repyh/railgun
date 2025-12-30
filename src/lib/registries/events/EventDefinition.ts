export interface EventDefinition {
    id: string;
    label: string;
    description?: string;
    nodeLabel: string;
    defaultContent: (id: string) => any;
}
