import React, { useEffect, useState } from 'react';
import { Save, RefreshCw, Settings, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useElectron } from '@/hooks/useElectron';
import { defaultConfigSchema } from '@/schemas/defaultConfigSchema';
import type { ConfigField } from '@/types/ConfigSchema';

interface ConfigTabProps {
    projectPath: string;
}

// Reusable Field Renderer
const ConfigFieldRenderer = ({
    field,
    value,
    onChange
}: {
    field: ConfigField;
    value: any;
    onChange: (val: any) => void;
}) => {
    const [showSecret, setShowSecret] = useState(false);

    // Determines the input type based on schema type
    const inputType = field.type === 'number' ? 'number' : field.type === 'secret' && !showSecret ? 'password' : 'text';

    if (field.type === 'boolean') {
        return (
            <div className="flex items-center gap-3 p-3 rounded-md border border-zinc-800 bg-zinc-900/20">
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    disabled={field.readonly}
                    onChange={(e) => onChange(e.target.checked)}
                    className="rounded border-zinc-600 bg-zinc-800 text-blue-500 h-4 w-4 focus:ring-blue-500 focus:ring-offset-zinc-900"
                />
                <div>
                    <Label className="cursor-pointer font-medium text-zinc-300">{field.label}</Label>
                    {field.description && <p className="text-xs text-zinc-500 mt-0.5">{field.description}</p>}
                </div>
            </div>
        );
    }

    if (field.type === 'select' && field.options) {
        const currentSelection = Array.isArray(value) ? value : [];

        const toggleSelection = (optionValue: string) => {
            if (currentSelection.includes(optionValue)) {
                onChange(currentSelection.filter((v: string) => v !== optionValue));
            } else {
                onChange([...currentSelection, optionValue]);
            }
        };

        return (
            <div className="space-y-3">
                <Label className="text-zinc-300 font-medium">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-md border border-zinc-800 bg-zinc-900/20">
                    {field.options.map(opt => (
                        <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={currentSelection.includes(opt.value)}
                                onChange={() => toggleSelection(opt.value as string)}
                                disabled={field.readonly}
                                className="rounded border-zinc-600 bg-zinc-800 text-blue-500 h-4 w-4 focus:ring-blue-500 focus:ring-offset-zinc-900 group-hover:border-blue-500 transition-colors"
                            />
                            <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{opt.label}</span>
                        </label>
                    ))}
                </div>
                {field.description && <p className="text-xs text-zinc-500">{field.description}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label className="text-zinc-300 font-medium">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
            </Label>
            <div className="relative">
                <Input
                    type={inputType}
                    value={value ?? ''}
                    placeholder={field.placeholder || (field.default ? `Default: ${field.default}` : '')}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(field.type === 'number' ? Number(val) : val);
                    }}
                    className="bg-zinc-950 border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={field.readonly}
                />
                {field.type === 'secret' && (
                    <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {field.description && <p className="text-xs text-zinc-500">{field.description}</p>}
        </div>
    );
};

export const ConfigTab: React.FC<ConfigTabProps> = ({ projectPath }) => {
    const [config, setConfig] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { isElectron, config: configAPI } = useElectron();

    const loadConfig = async () => {
        if (!projectPath || !isElectron) return;
        setIsLoading(true);
        try {
            const data = await configAPI.read(projectPath);
            // Handle loading: if data exists, use it. If not, use empty object.
            setConfig(data || {});
        } catch (error) {
            console.error('Failed to load railgun.json', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, [projectPath]);

    const handleSave = async () => {
        if (!projectPath || !isElectron) return;
        setIsSaving(true);
        try {
            // Validating required fields
            for (const group of defaultConfigSchema.groups) {
                for (const field of group.fields) {
                    if (field.required && !config[field.key]) {
                        alert(`Missing required field: ${field.label}`); // simple alert for now
                        setIsSaving(false);
                        return;
                    }
                }
            }

            await configAPI.save(projectPath, config);
        } catch (error) {
            console.error('Failed to save railgun.json', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = (key: string, value: any) => {
        setConfig((prev: any) => ({
            ...prev,
            [key]: value
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading Config...
            </div>
        );
    }

    return (
        <div className="h-full w-full p-6 overflow-auto bg-background">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                            Configuration
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">Manage project settings</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={loadConfig}
                            disabled={isLoading}
                            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-500 text-white min-w-[120px]"
                        >
                            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    {defaultConfigSchema.groups.map(group => (
                        <div key={group.id} className="space-y-4">
                            <div className="border-b border-zinc-800 pb-2">
                                <h3 className="text-lg font-medium text-zinc-200">{group.label}</h3>
                                {group.description && <p className="text-sm text-zinc-500">{group.description}</p>}
                            </div>

                            <div className="grid gap-6">
                                {group.fields.map(field => (
                                    <ConfigFieldRenderer
                                        key={field.key}
                                        field={field}
                                        value={config[field.key]}
                                        onChange={(val) => handleUpdate(field.key, val)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Fallback for unknown keys (optional, but good for not losing data) */}
                    {Object.keys(config).filter(k => k !== 'config' && !defaultConfigSchema.groups.some(g => g.fields.some(f => f.key === k))).length > 0 && (
                        <div className="mt-8 pt-8 border-t border-zinc-800/50">
                            <h4 className="text-sm font-medium text-zinc-500 mb-4">Additional Settings (Unrecognized)</h4>
                            <div className="space-y-4 opacity-75">
                                {Object.keys(config)
                                    .filter(k => k !== 'config' && !defaultConfigSchema.groups.some(g => g.fields.some(f => f.key === k)))
                                    .map(key => (
                                        <div key={key} className="space-y-1">
                                            <Label className="text-zinc-400">{key}</Label>
                                            <Input
                                                value={config[key]}
                                                onChange={(e) => handleUpdate(key, e.target.value)}
                                                className="bg-zinc-950 border-zinc-800"
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

