export type ConfigFieldType = 'string' | 'number' | 'boolean' | 'select' | 'color' | 'secret';

export interface ConfigField {
    key: string;
    label: string;
    type: ConfigFieldType;
    description?: string;
    placeholder?: string;
    default?: any;
    required?: boolean;
    options?: { label: string; value: string | number }[]; // For 'select' type
    readonly?: boolean;
}

export interface ConfigGroup {
    id: string;
    label: string;
    description?: string;
    fields: ConfigField[];
}

export interface ConfigSchema {
    groups: ConfigGroup[];
}
