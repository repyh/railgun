import type { StatementGenerator } from '../../interfaces';

export const CallFunctionStatement: StatementGenerator = (node, ctx, processor) => {
    const arg0 = processor.resolveInput(node, 'arg0', ctx) || 'undefined';
    const arg1 = processor.resolveInput(node, 'arg1', ctx) || 'undefined';
    const arg2 = processor.resolveInput(node, 'arg2', ctx) || 'undefined';

    let funcName = 'myFunc';

    const fnConn = processor.findConnection(node.id, 'fn', 'in');
    if (fnConn) {
        const funcNode = processor.getNode(fnConn.source);
        if (funcNode && funcNode.label === 'Function Def') {
            const nameControl = funcNode.controls?.['name'] as any;
            funcName = nameControl?.value || 'myFunc_' + funcNode.id.replace(/-/g, '_');
        }
    }

    const resVar = `res_${node.id.replace(/-/g, '_')}`;
    return `const ${resVar} = await ${funcName}(${arg0}, ${arg1}, ${arg2});\n`;
};
