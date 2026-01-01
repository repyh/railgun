
import type { SettingsTabDefinition } from '@/types/SettingDefinitions';
import { AutoSettingsRenderer } from './components/AutoSettingsRenderer';
import React from 'react';

// A tab can provide EITHER a custom component OR a declarative definition.
export interface SettingsTabModule {
    id: string;
    label: string;
    component?: React.ComponentType;
    definitions?: SettingsTabDefinition; // If provided, uses AutoSettingsRenderer
    order?: number;
}

class SettingsTabRegistryImpl {
    private tabs: SettingsTabModule[] = [];

    register(tab: SettingsTabModule | SettingsTabDefinition) {
        // Prevent duplicate registration
        if (this.tabs.find(t => t.id === tab.id)) return;

        let module: SettingsTabModule;

        // Check if it's a Definition (has groups)
        if ('groups' in tab) {
            module = {
                id: tab.id,
                label: tab.label,
                definitions: tab as SettingsTabDefinition,
                component: () => React.createElement(AutoSettingsRenderer, { groups: tab.groups })
            };
        } else {
            module = tab;
            // If definition is provided but no component, assign the AutoRenderer
            if (module.definitions && !module.component) {
                module.component = () => React.createElement(AutoSettingsRenderer, { groups: module.definitions!.groups });
            }
        }

        this.tabs.push(module);
        this.tabs.sort((a, b) => (a.order || 99) - (b.order || 99));
    }

    getTabs() {
        return this.tabs;
    }
}

export const SettingsTabRegistry = new SettingsTabRegistryImpl();

