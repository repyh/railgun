import React, { useEffect, useState } from 'react';
import { Save, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface ConfigTabProps {
    projectPath: string;
}

// Helper to strip tags and format label
const formatLabel = (str: string) => {
    const clean = str.split(':')[0];
    return clean
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
};

const getTypeFromKey = (key: string): 'string' | 'number' | 'boolean' | 'any' => {
    const lower = key.toLowerCase();
    if (lower.includes(':number')) return 'number';
    if (lower.includes(':string')) return 'string';
    if (lower.includes(':boolean')) return 'boolean';
    return 'any';
};

// Component for rendering Objects
const ConfigObject = ({
    data,
    path,
    isEditable,
    onUpdate
}: {
    data: any;
    path: string[];
    isEditable: boolean;
    onUpdate: (path: string[], value: any) => void;
}) => {
    const [newKey, setNewKey] = useState('');
    const [newType, setNewType] = useState('string');
    const [newIsEditable, setNewIsEditable] = useState(true);

    const handleAddProperty = () => {
        if (!newKey) return;

        let finalKey = newKey;

        if (newType === 'number') finalKey += ':number';
        if (newType === 'string') finalKey += ':string';
        if (newType === 'boolean') finalKey += ':boolean';
        if (newIsEditable) finalKey += ':editable';

        let initValue: any = '';
        if (newType === 'number') initValue = 0;
        if (newType === 'boolean') initValue = false;
        if (newType === 'array') initValue = [];
        if (newType === 'object') initValue = {};

        const newData = { ...data, [finalKey]: initValue };
        onUpdate(path, newData);
        setNewKey('');
    };

    const handleDeleteProperty = (keyToDelete: string) => {
        const newData = { ...data };
        delete newData[keyToDelete];
        onUpdate(path, newData);
    };

    return (
        <div className={`space-y-4 p-4 rounded-lg border ${isEditable ? 'bg-zinc-900/20 border-zinc-800' : 'bg-zinc-900/10 border-zinc-800/40 opacity-80'}`}>
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="relative group/obj-item">
                    <ConfigNode
                        name={key}
                        value={value}
                        path={[...path, key]}
                        onUpdate={onUpdate}
                    />
                    {isEditable && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProperty(key)}
                            className="absolute top-0 right-0 -mt-2 -mr-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover/obj-item:opacity-100 transition-opacity"
                        >
                            &times;
                        </Button>
                    )}
                </div>
            ))}

            {isEditable && (
                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-2 items-end">
                    <div className="flex-1 min-w-[120px]">
                        <Label className="text-xs text-zinc-500 mb-1 block">New Property Name</Label>
                        <Input
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="e.g. maxRetries"
                            className="h-8 text-sm bg-zinc-950 border-zinc-800"
                        />
                    </div>
                    <div className="w-[100px]">
                        <Label className="text-xs text-zinc-500 mb-1 block">Type</Label>
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            className="h-8 w-full rounded-md border border-zinc-800 bg-zinc-950 text-sm px-2 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="array">Array</option>
                            <option value="object">Object</option>
                        </select>
                    </div>
                    <div className="flex items-center pb-2 px-2 gap-2 bg-zinc-900/50 rounded border border-zinc-800/50 h-8">
                        <input
                            type="checkbox"
                            checked={newIsEditable}
                            onChange={(e) => setNewIsEditable(e.target.checked)}
                            className="rounded border-zinc-600 bg-zinc-800 text-blue-500 h-3.5 w-3.5"
                        />
                        <span className="text-xs text-zinc-400">Editable</span>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleAddProperty}
                        className="h-8 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 border border-blue-500/30"
                    >
                        Add
                    </Button>
                </div>
            )}
        </div>
    );
};

// Component for rendering Arrays
const ConfigArray = ({
    data,
    path,
    isEditable,
    onUpdate,
    explicitType
}: {
    data: any[];
    path: string[];
    isEditable: boolean;
    onUpdate: (path: string[], value: any) => void;
    explicitType: string;
}) => {
    const handleAddItem = () => {
        let newItem: any = '';
        if (explicitType === 'number') newItem = 0;
        if (explicitType === 'boolean') newItem = false;
        if (explicitType === 'any' && data.length > 0) {
            const first = data[0];
            if (typeof first === 'number') newItem = 0;
            if (typeof first === 'boolean') newItem = false;
            if (typeof first === 'object') newItem = {};
        } else if (explicitType === 'any') { // If array is empty and type is 'any', default to string
            newItem = '';
        }

        onUpdate(path, [...data, newItem]);
    };

    const handleRemoveItem = (index: number) => {
        const newData = data.filter((_, i) => i !== index);
        onUpdate(path, newData);
    };

    const handleItemChange = (index: number, val: any) => {
        const newData = [...data];
        newData[index] = val;
        onUpdate(path, newData);
    };

    return (
        <div className={`space-y-3 p-4 rounded-lg border ${isEditable ? 'bg-zinc-900/30 border-zinc-800' : 'bg-zinc-900/10 border-zinc-800/50 opacity-80'}`}>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex gap-2 group relative">
                        {typeof item === 'object' && item !== null ? (
                            <div className="flex-1">
                                <ConfigObject
                                    data={item}
                                    path={[...path, index.toString()]}
                                    isEditable={false} // Implicit: Objects in array follow their own key rules
                                    onUpdate={onUpdate}
                                />
                            </div>
                        ) : (
                            <Input
                                type={explicitType === 'number' ? 'number' : 'text'}
                                value={item}
                                disabled={!isEditable} // Primitives in editable array are editable
                                onChange={(e) => {
                                    const val = e.target.value;
                                    handleItemChange(index, explicitType === 'number' ? Number(val) : val);
                                }}
                                className="bg-zinc-950 border-zinc-800 focus:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        )}

                        {isEditable && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(index)}
                                className="text-zinc-500 hover:text-red-400 hover:bg-red-900/10 opacity-50 group-hover:opacity-100 transition-all"
                            >
                                &times;
                            </Button>
                        )}
                    </div>
                ))}

                {isEditable && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddItem}
                        className="w-full border-dashed border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 mt-2"
                    >
                        + Add Item
                    </Button>
                )}
            </div>
        </div>
    );
};

// Generic Node that decides what to render
const ConfigNode = ({
    name,
    value,
    path,
    onUpdate
}: {
    name: string;
    value: any;
    path: string[];
    onUpdate: (path: string[], value: any) => void;
}) => {
    const isSelfEditable = name.includes(':editable');
    const isEditable = isSelfEditable;

    const label = formatLabel(name);
    const explicitType = getTypeFromKey(name);

    // Arrays
    if (Array.isArray(value)) {
        return (
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-zinc-300">{label}</Label>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{value.length} items</span>
                </div>
                <ConfigArray
                    data={value}
                    path={path}
                    isEditable={isEditable}
                    onUpdate={onUpdate}
                    explicitType={explicitType}
                />
            </div>
        );
    }

    // Objects
    if (typeof value === 'object' && value !== null) {
        return (
            <div className="mb-6">
                <h4 className={`font-medium border-b border-zinc-800 pb-2 mb-4 ${isEditable ? 'text-zinc-200' : 'text-zinc-500'}`}>{label}</h4>
                <ConfigObject
                    data={value}
                    path={path}
                    isEditable={isEditable}
                    onUpdate={onUpdate}
                />
            </div>
        );
    }

    // Primitives
    const isNumber = explicitType === 'number' || (explicitType === 'any' && typeof value === 'number');
    const isBoolean = explicitType === 'boolean' || (explicitType === 'any' && typeof value === 'boolean');

    if (isBoolean) {
        return (
            <div className={`flex items-center gap-3 mb-4 p-3 rounded-md border bg-zinc-900/20 ${!isEditable ? 'border-zinc-800/30 opacity-70' : 'border-zinc-800/50'}`}>
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    disabled={!isEditable}
                    onChange={(e) => onUpdate(path, e.target.checked)}
                    className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-offset-0 focus:ring-blue-500/50 h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Label className="cursor-pointer">{label}</Label>
            </div>
        );
    }

    return (
        <div className="space-y-2 mb-4">
            <Label className={`text-zinc-300 ${!isEditable && 'opacity-70'}`}>{label}</Label>
            <Input
                type={isNumber ? 'number' : 'text'}
                value={value}
                disabled={!isEditable}
                onChange={(e) => {
                    const val = e.target.value;
                    onUpdate(path, isNumber ? Number(val) : val);
                }}
                className="bg-zinc-950 border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
};

export const ConfigTab: React.FC<ConfigTabProps> = ({ projectPath }) => {
    const [config, setConfig] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const loadConfig = async () => {
        if (!projectPath || !window.electronAPI) return;
        setIsLoading(true);
        try {
            const data = await window.electronAPI.readProjectConfig(projectPath);
            setConfig(data);
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
        if (!projectPath || !window.electronAPI || !config) return;
        setIsSaving(true);
        try {
            await window.electronAPI.saveProjectConfig(projectPath, config);
        } catch (error) {
            console.error('Failed to save railgun.json', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = (path: string[], value: any) => {
        setConfig((prev: any) => {
            const newConfig = JSON.parse(JSON.stringify(prev)); // Deep clone
            let current = newConfig;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newConfig;
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading Config...
            </div>
        );
    }

    if (!config) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <p>No Configuration Found</p>
                <Button variant="outline" size="sm" onClick={loadConfig} className="mt-4">Retry</Button>
            </div>
        );
    }

    const rootPath = config.config ? ['config'] : [];
    const rootData = config.config || config;

    return (
        <div className="h-full w-full p-6 overflow-auto bg-background">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                            <Settings className="w-6 h-6 text-blue-500" />
                            Configuration
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">Manage dynamic project settings</p>
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

                <div className="space-y-6">

                    {/* Compiler Settings Section */}
                    <div className="p-4 rounded-lg border bg-zinc-900/30 border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-200">Compiler Engine</h3>
                                <p className="text-xs text-zinc-500">The underlying technology used to build your bot</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    AST Pipeline
                                </span>
                            </div>
                        </div>
                    </div>

                    <ConfigObject
                        data={rootData}
                        path={rootPath}
                        isEditable={false}
                        onUpdate={handleUpdate}
                    />
                </div>
            </div>
        </div>
    );
};
