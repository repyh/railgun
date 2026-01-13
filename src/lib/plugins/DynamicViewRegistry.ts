import type { RailgunBridge, PluginViewDefinition } from './interfaces';

export type MountFunction = (el: HTMLElement, api: RailgunBridge) => void | (() => void);

export interface DynamicView extends PluginViewDefinition {
    pluginId: string;
    mounter?: MountFunction;
}

class DynamicViewRegistryImpl {
    private views: Map<string, DynamicView> = new Map();

    register(view: DynamicView) {
        console.log(`[DynamicViewRegistry] Registering view: ${view.id} from plugin ${view.pluginId}`);
        this.views.set(view.id, view);
    }

    unregisterPluginViews(pluginId: string) {
        for (const [id, view] of this.views.entries()) {
            if (view.pluginId === pluginId) {
                this.views.delete(id);
            }
        }
    }

    getAllViews(): DynamicView[] {
        return Array.from(this.views.values());
    }

    getView(id: string): DynamicView | undefined {
        return this.views.get(id);
    }

    setMounter(viewId: string, mounter: MountFunction) {
        const view = this.views.get(viewId);
        if (view) {
            view.mounter = mounter;
        } else {
            console.warn(`[DynamicViewRegistry] Attempted to set mounter for unknown view: ${viewId}`);
        }
    }
}

export const DynamicViewRegistry = new DynamicViewRegistryImpl();
