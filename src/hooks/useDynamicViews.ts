import { useState, useEffect } from 'react';
import { DynamicViewRegistry, type DynamicView } from '@/lib/plugins/DynamicViewRegistry';

/**
 * Hook to get and track dynamic plugin views.
 * For now it's a simple snapshot, but can be expanded with events.
 */
export const useDynamicViews = () => {
    const [views, setViews] = useState<DynamicView[]>(DynamicViewRegistry.getAllViews());

    useEffect(() => {
        // Since PluginManager.init() is async and happens after first render,
        // we might need a way to trigger an update here.
        // For now, we'll just check again after a short delay or handle it via a simple interval 
        // until we add an EventEmitter to the Registry.

        setViews(DynamicViewRegistry.getAllViews());

        const interval = setInterval(() => {
            const current = DynamicViewRegistry.getAllViews();
            if (current.length !== views.length) {
                setViews(current);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [views.length]);

    return views;
};
