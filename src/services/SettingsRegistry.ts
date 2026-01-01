
export interface SettingsSection {
    defaults: Record<string, any>;
}

class SettingsRegistryImpl {
    private sections: Record<string, SettingsSection> = {};

    registerSection(namespace: string, defaults: Record<string, any>) {
        if (this.sections[namespace]) {
            console.warn(`Settings section "${namespace}" is already registered. Merging defaults.`);
            this.sections[namespace].defaults = {
                ...this.sections[namespace].defaults,
                ...defaults
            };
        } else {
            this.sections[namespace] = { defaults };
        }
    }

    getDefaults(): Record<string, any> {
        const mergedDefaults: Record<string, any> = {};
        for (const [namespace, section] of Object.entries(this.sections)) {
            mergedDefaults[namespace] = section.defaults;
        }
        return mergedDefaults;
    }
}

export const SettingsRegistry = new SettingsRegistryImpl();
