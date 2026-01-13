import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { FolderOpen, Plus, X, Eye, EyeOff } from 'lucide-react';
import { type ModalField } from '@/lib/modal-builder/types';
import { useElectron } from '@/hooks/useElectron';

interface FieldRendererProps {
    field: ModalField;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field }) => {
    const { control, register, setValue } = useFormContext();
    const { isElectron, window: win } = useElectron();
    const [showPassword, setShowPassword] = React.useState(false);

    const handleBrowse = async () => {
        if (!isElectron) return;
        try {
            const selected = await win.selectDirectory();
            if (selected) {
                setValue(field.id, selected, { shouldValidate: true, shouldDirty: true });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const renderInput = () => {
        switch (field.type) {
            case 'text':
            case 'password':
            case 'number':
                return (
                    <div className="relative">
                        <Input
                            type={field.type === 'password' ? (showPassword ? 'text' : 'password') : field.type}
                            placeholder={field.placeholder}
                            disabled={field.disabled}
                            className={field.type === 'password' ? 'pr-10' : ''}
                            {...register(field.id, {
                                required: field.required,
                                valueAsNumber: field.type === 'number'
                            })}
                        />
                        {field.type === 'password' && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <Controller
                        control={control}
                        name={field.id}
                        rules={{ required: field.required }}
                        render={({ field: { onChange, value } }) => (
                            <Select onValueChange={onChange} value={value} disabled={field.disabled}>
                                <SelectTrigger className="h-9 border-zinc-800 bg-zinc-900/50">
                                    <SelectValue placeholder={field.placeholder || "Select an option"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                );

            case 'toggle':
                return (
                    <Controller
                        control={control}
                        name={field.id}
                        render={({ field: { onChange, value } }) => (
                            <div className="flex items-center space-x-3 bg-zinc-900/40 p-3 rounded-md border border-zinc-800/50 shadow-sm">
                                <Switch
                                    checked={value}
                                    onCheckedChange={onChange}
                                    disabled={field.disabled}
                                    id={field.id}
                                />
                                <div className="space-y-0.5">
                                    <Label htmlFor={field.id} className="text-sm font-medium text-zinc-100 cursor-pointer">
                                        {field.placeholder || "Enable"}
                                    </Label>
                                    {field.description && (
                                        <p className="text-[11px] text-zinc-500 line-clamp-1">{field.description}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    />
                );

            case 'path-browse':
                return (
                    <div className="flex gap-2">
                        <Input
                            {...register(field.id, { required: field.required })}
                            readOnly
                            placeholder={field.placeholder || "Select a path..."}
                            className="flex-1 font-mono text-[11px] bg-zinc-900/50 border-zinc-800"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={() => handleBrowse()}
                            disabled={field.disabled}
                            className="shrink-0 border-zinc-800 hover:bg-zinc-800"
                        >
                            <FolderOpen className="h-4 w-4 text-zinc-400" />
                        </Button>
                    </div>
                );

            case 'dynamic-list':
                return <DynamicListRenderer field={field} />;

            case 'slash-options':
                return <SlashOptionsRenderer field={field} />;

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-1.5">
            {field.type !== 'toggle' && (
                <div className="flex items-baseline justify-between">
                    <Label htmlFor={field.id} className="text-[13px] font-semibold text-zinc-200">
                        {field.label} {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </Label>
                </div>
            )}
            {renderInput()}
            {field.description && field.type !== 'toggle' && (
                <p className="text-[11px] text-zinc-500 leading-relaxed">{field.description}</p>
            )}
        </div>
    );
};

interface DynamicListRendererProps {
    field: ModalField & { type: 'dynamic-list' };
}

const DynamicListRenderer: React.FC<DynamicListRendererProps> = ({ field }) => {
    const { setValue, watch } = useFormContext();
    const items: string[] = watch(field.id) || [];
    const [newItem, setNewItem] = React.useState('');

    const handleAdd = () => {
        const val = newItem.trim();
        if (val && !items.includes(val)) {
            setValue(field.id, [...items, val], { shouldDirty: true });
            setNewItem('');
        }
    };

    const handleRemove = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setValue(field.id, newItems, { shouldDirty: true });
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={field.itemPlaceholder || "Add item..."}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    className="h-9 bg-zinc-900/50 border-zinc-800"
                    disabled={field.disabled}
                />
                <Button
                    onClick={handleAdd}
                    variant="secondary"
                    size="sm"
                    type="button"
                    disabled={field.disabled}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                    <Plus size={16} />
                </Button>
            </div>

            <div className="grid gap-1.5 mt-2">
                {items.length === 0 && (
                    <div className="text-[11px] text-zinc-600 italic text-center py-4 bg-zinc-900/20 rounded border border-dashed border-zinc-800/50">
                        No entries yet.
                    </div>
                )}
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 rounded-sm px-2.5 py-1.5 text-xs">
                        <span className="font-mono text-zinc-400">{item}</span>
                        <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
interface SlashOptionsRendererProps {
    field: ModalField & { type: 'slash-options' };
}

const SlashOptionsRenderer: React.FC<SlashOptionsRendererProps> = ({ field }) => {
    const { setValue, watch } = useFormContext();
    const options: any[] = watch(field.id) || [];

    const [optName, setOptName] = React.useState('');
    const [optDesc, setOptDesc] = React.useState('');
    const [optType, setOptType] = React.useState('STRING');
    const [optRequired, setOptRequired] = React.useState(false);

    const handleAdd = () => {
        if (optName && optDesc) {
            const newOption = {
                name: optName.toLowerCase().replace(/\s+/g, '-'),
                description: optDesc,
                type: optType,
                required: optRequired
            };
            setValue(field.id, [...options, newOption], { shouldDirty: true });
            setOptName('');
            setOptDesc('');
            setOptType('STRING');
            setOptRequired(false);
        }
    };

    const handleRemove = (index: number) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setValue(field.id, newOptions, { shouldDirty: true });
    };

    return (
        <div className="space-y-4">
            <div className="bg-zinc-900/40 p-4 rounded-md border border-zinc-800/50 space-y-4 shadow-sm">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Option Name</Label>
                        <Input
                            value={optName}
                            onChange={e => setOptName(e.target.value)}
                            placeholder="e.g. user"
                            className="h-8 text-xs bg-zinc-900/50 border-zinc-800 focus:bg-zinc-900"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Type</Label>
                        <Select value={optType} onValueChange={setOptType}>
                            <SelectTrigger className="h-8 text-xs bg-zinc-900/50 border-zinc-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                {['STRING', 'INTEGER', 'BOOLEAN', 'USER', 'CHANNEL', 'ROLE', 'MENTIONABLE', 'NUMBER', 'ATTACHMENT'].map(t => (
                                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Description</Label>
                    <Input
                        value={optDesc}
                        onChange={e => setOptDesc(e.target.value)}
                        placeholder="What is this option for?"
                        className="h-8 text-xs bg-zinc-900/50 border-zinc-800 focus:bg-zinc-900"
                    />
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={optRequired}
                            onCheckedChange={setOptRequired}
                            id="opt-required"
                        />
                        <Label htmlFor="opt-required" className="text-xs font-medium text-zinc-300 cursor-pointer">Required</Label>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleAdd}
                        disabled={!optName || !optDesc}
                        className="h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 gap-1.5 px-3"
                    >
                        <Plus size={14} />
                        Add Option
                    </Button>
                </div>
            </div>

            <div className="grid gap-2 min-h-[40px]">
                {options.length === 0 && (
                    <div className="text-[11px] text-zinc-600 italic text-center py-6 bg-zinc-900/10 rounded border border-dashed border-zinc-900/30">
                        No command options defined.
                    </div>
                )}
                {options.map((opt, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 rounded-md px-3 py-2.5 animate-in slide-in-from-top-1 fade-in duration-200 shadow-sm transition-all hover:bg-zinc-900/40">
                        <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${opt.required ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                {opt.required ? 'REQUIRED' : 'OPTIONAL'}
                            </span>
                            <div className="flex flex-col">
                                <span className="font-semibold text-zinc-200 text-sm">{opt.name}</span>
                                <span className="text-[10px] text-zinc-500 font-mono italic">{opt.type}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemove(i)}
                            className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
