


export type SettingType = 'toggle' | 'text' | 'number' | 'select' | 'color';

export interface SettingOption {
    label: string;
    value: string | number | boolean;
}

export interface SettingDefinition {
    key: string; // e.g., "rpc.showCurrentFile"
    label: string;
    description?: string;
    type: SettingType;
    options?: SettingOption[]; // For 'select'
    min?: number; // For 'number'
    max?: number;
    step?: number;
    defaultValue?: any;
}

export interface SettingGroupDefinition {
    id: string;
    title: string;
    description?: string;
    settings: SettingDefinition[];
}

export interface SettingsTabDefinition {
    id: string;
    label: string;
    groups: SettingGroupDefinition[];
}
