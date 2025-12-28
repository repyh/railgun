import type { StatementGenerator } from '../../interfaces';

export const SetVariableGenerator: StatementGenerator = (node, ctx, processor) => {
    const val = processor.resolveInput(node, 'value', ctx);
    let varName = 'temp';

    // Try to get variable name from connection
    const varConn = processor.findConnection(node.id, 'variable', 'in');


    if (varConn) {
        // Try to resolve variable name via InputResolver
        const resolved = processor.resolveInput(node, 'variable', ctx);
        if (resolved && resolved !== 'undefined' && resolved !== 'null') {
            varName = resolved;
        } else {
            // Fallback for special nodes if resolveInput fails?
            // Existing logic for Function Def manual check:
            const sourceNode = processor.getNode(varConn.source);
            if (sourceNode && sourceNode.label === 'Function Def') {
                if (varConn.sourceOutput === 'ret') {
                    varName = 'ret';
                } else if (varConn.sourceOutput === 'fn') {
                    const nameControl = sourceNode.controls?.['name'] as any;
                    varName = nameControl?.value || 'myFunc_' + sourceNode.id.replace(/-/g, '_');
                }
            }
        }
    } else {
        const inputCtrl = node.controls?.['varName'] as any;
        if (inputCtrl && inputCtrl.value) {
            varName = inputCtrl.value;
        }
    }

    return `${varName} = ${val};\n`;
};
