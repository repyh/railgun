
import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import type { SettingDefinition, SettingGroupDefinition } from '@/types/SettingDefinitions';
import { SettingGroup, SettingRow, SettingToggle } from './SettingUI';

interface AutoSettingsRendererProps {
    groups: SettingGroupDefinition[];
}

export const AutoSettingsRenderer: React.FC<AutoSettingsRendererProps> = ({ groups }) => {
    const { settings, updateSettings } = useSettings();

    const getValue = (path: string): any => {
        const parts = path.split('.');
        let current: any = settings;
        for (const part of parts) {
            if (current === undefined || current === null) return undefined;
            current = current[part];
        }
        return current;
    };

    const setValue = (path: string, value: any) => {
        const parts = path.split('.');
        if (parts.length === 0) return;

        if (parts.length === 1) {
            // @ts-ignore
            updateSettings(parts[0], value);
            return;
        }

        const section = parts[0];
        const key = parts[1];

        if (parts.length === 2) {
            // @ts-ignore
            updateSettings(section, { [key]: value });
        } else {
            console.warn("Deep nesting specific updates not fully implemented yet in AutoRenderer, checking if simple merge works.");
            // @ts-ignore
            updateSettings(section, { [key]: value });
        }
    };

    const renderControl = (def: SettingDefinition, currentValue: any) => {
        switch (def.type) {
            case 'toggle':
                return (
                    <SettingToggle
                        checked={!!currentValue}
                        onChange={(val) => setValue(def.key, val)}
                    />
                );
            case 'select':
                return (
                    <select
                        className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
                        value={currentValue ?? ''}
                        onChange={(e) => setValue(def.key, e.target.value)}
                    >
                        {def.options?.map(opt => (
                            <option key={String(opt.value)} value={String(opt.value)}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case 'text':
                return (
                    <input
                        type="text"
                        className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500 w-full max-w-[200px]"
                        value={currentValue ?? ''}
                        onChange={(e) => setValue(def.key, e.target.value)}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-zinc-300 outline-none focus:ring-1 focus:ring-blue-500 w-20 text-center font-mono"
                        value={currentValue ?? 0}
                        min={def.min}
                        max={def.max}
                        onChange={(e) => setValue(def.key, parseFloat(e.target.value))}
                    />
                );
            case 'color':
                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={currentValue ?? '#000000'}
                            onChange={(e) => setValue(def.key, e.target.value)}
                            className="w-6 h-6 rounded overflow-hidden p-0 border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs font-mono text-zinc-500">{currentValue}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            {groups.map(group => (
                <SettingGroup
                    key={group.id}
                    title={group.title}
                    description={group.description}
                >
                    {group.settings.map(setting => (
                        <SettingRow
                            key={setting.key}
                            label={setting.label}
                            description={setting.description}
                            settingKey={setting.key}
                        >
                            {renderControl(setting, getValue(setting.key))}
                        </SettingRow>
                    ))}
                </SettingGroup>
            ))}
        </div>
    );
};
