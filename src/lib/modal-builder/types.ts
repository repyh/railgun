import type { ReactNode } from 'react';

export const MODAL_VERSION = '1.0.0';

/**
 * Supported field types for the ModalBuilder.
 */
export type FieldType = 'text' | 'number' | 'select' | 'path-browse' | 'dynamic-list' | 'toggle' | 'password' | 'slash-options';

export interface BaseField {
    id: string;
    label: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: any;
    disabled?: boolean;
}

export interface TextField extends BaseField {
    type: 'text' | 'password';
}

export interface NumberField extends BaseField {
    type: 'number';
    min?: number;
    max?: number;
    step?: number;
}

export interface SelectOption {
    label: string;
    value: string;
}

export interface SelectField extends BaseField {
    type: 'select';
    options: SelectOption[];
}

export interface PathBrowseField extends BaseField {
    type: 'path-browse';
    directory?: boolean; // If true, select directory. If false, select file. [Default: true]
}

export interface DynamicListField extends BaseField {
    type: 'dynamic-list';
    itemPlaceholder?: string;
    maxItems?: number;
}

export interface ToggleField extends BaseField {
    type: 'toggle';
}

export interface SlashOptionsField extends BaseField {
    type: 'slash-options';
}

export type ModalField = TextField | NumberField | SelectField | PathBrowseField | DynamicListField | ToggleField | SlashOptionsField;

export interface ModalSchema {
    id: string;
    title: string;
    description?: string;
    fields: ModalField[];
    submitLabel?: string;
    cancelLabel?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';

    /**
     * Optional custom footer content (left side)
     */
    footerLeft?: ReactNode;
}
