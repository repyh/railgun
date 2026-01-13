import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { type ModalSchema } from '@/lib/modal-builder/types';
import { FieldRenderer } from './FieldRenderer';

interface ModalBuilderProps {
    schema: ModalSchema;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void> | void;
    initialData?: any;
    isLoading?: boolean;
}

export const ModalBuilder: React.FC<ModalBuilderProps> = ({
    schema,
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isLoading
}) => {
    const methods = useForm({
        defaultValues: initialData || {},
        mode: 'onChange'
    });

    const { handleSubmit, reset, formState: { isValid, isSubmitting } } = methods;

    useEffect(() => {
        if (open) {
            reset(initialData || {});
        }
    }, [open, initialData, reset]);

    const handleFormSubmit = async (data: any) => {
        try {
            await onSubmit(data);
            onOpenChange(false);
        } catch (error) {
            console.error('Modal submission error:', error);
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-[400px]',
        md: 'sm:max-w-[540px]',
        lg: 'sm:max-w-[720px]',
        xl: 'sm:max-w-[960px]',
    }[schema.size || 'md'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${maxWidthClass} border-zinc-900 bg-zinc-950/95 backdrop-blur-2xl ring-1 ring-white/5 p-0 overflow-hidden`}>
                <DialogHeader className="p-6 border-b border-zinc-900 bg-zinc-900/10">
                    <DialogTitle className="text-xl font-bold tracking-tight text-white">{schema.title}</DialogTitle>
                    {schema.description && (
                        <DialogDescription className="text-zinc-500 mt-1.5">{schema.description}</DialogDescription>
                    )}
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
                        <div className="grid gap-6 p-6 overflow-y-auto max-h-[70vh]">
                            {schema.fields.map((field) => (
                                <FieldRenderer key={field.id} field={field} />
                            ))}
                        </div>

                        <DialogFooter className="p-4 bg-zinc-900/20 border-t border-zinc-900 flex items-center justify-end gap-3">
                            {schema.footerLeft && (
                                <div className="mr-auto">
                                    {schema.footerLeft}
                                </div>
                            )}

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting || isLoading}
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                            >
                                {schema.cancelLabel || "Cancel"}
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting || isLoading}
                                className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                            >
                                {isLoading || isSubmitting ? 'Processing...' : (schema.submitLabel || "OK")}
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
};
