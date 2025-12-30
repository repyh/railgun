import * as AST from '../types';
import { PluginManager } from '../../../plugins/PluginManager';

export class PluginInjectionStrategy {
    execute(program: AST.Program): string[] {
        const injectedStmts: string[] = [];

        if (program.usedPlugins) {
            for (const pluginId of program.usedPlugins) {
                const manifest = PluginManager.getManifest(pluginId);
                const safeId = pluginId.replace(/[^a-zA-Z0-9_]/g, '_');
                const varName = `plugin_${safeId}`;

                if (manifest && manifest.botm?.runtime) {
                    // Normalize to forward slashes for require
                    const relativeRuntime = manifest.botm.runtime.replace(/\\/g, '/');
                    const requirePath = `./plugins/${pluginId}/${relativeRuntime}`;
                    injectedStmts.push(`const ${varName} = require('${requirePath}');`);
                } else {
                    // Fallback/Warning if manifest or runtime not found
                    injectedStmts.push(`// WARNING: Plugin ${pluginId} runtime not found or invalid manifest!`);
                }
            }
        }

        return injectedStmts;
    }
}
