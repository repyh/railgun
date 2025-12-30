import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/Select';

interface CreateEventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateEvent: (name: string, type: string) => void;
}
import { eventRegistry } from '@/lib/registries/EventRegistry';


export function CreateEventModal({ open, onOpenChange, onCreateEvent }: CreateEventModalProps) {
    const eventTypes = eventRegistry.getAll();
    const [name, setName] = useState('');
    const [type, setType] = useState(eventTypes[0]?.id || '');

    const handleCreate = () => {
        if (name) {
            onCreateEvent(name, type);
            setName('');
            setName('');
            setType(eventTypes[0]?.id || '');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 px-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. my-event"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Event Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {eventTypes.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!name}>
                        Create Event
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
