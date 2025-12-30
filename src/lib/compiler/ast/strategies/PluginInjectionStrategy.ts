import * as AST from '../types';
import { PluginManager } from '../../../plugins/PluginManager';

export class PluginInjectionStrategy {
    execute(program: AST.Program): string[] {
        const injectedStmts: string[] = [];

        if (program.usedPlugins) {
            for (const pluginId of program.usedPlugins) {
                const manifest = PluginManager.getManifest(pluginId);

                // 1. Sanitize ID for variable naming
                const safeVarId = pluginId.replace(/[^a-zA-Z0-9_]/g, '_');
                const varName = `plugin_${safeVarId}`;

                if (manifest && manifest.botm?.runtime) {
                    // 2. Sanitize ID and Runtime for path safety (prevent path traversal)
                    const safePathId = pluginId.replace(/[^a-zA-Z0-9\-_]/g, '');
                    const safeRuntime = manifest.botm.runtime.replace(/\\/g, '/').replace(/\.\.\//g, '');

                    const requirePath = `./plugins/${safePathId}/${safeRuntime}`;
                    injectedStmts.push(`const ${varName} = require('${requirePath}');`);
                } else {
                    // 3. Sanitize ID for comment safety
                    const safeCommentId = pluginId.replace(/[^a-zA-Z0-9\-_]/g, '');
                    injectedStmts.push(`// WARNING: Plugin ${safeCommentId} runtime not found or invalid manifest!`);
                }
            }
        }

        return injectedStmts;
    }
}
