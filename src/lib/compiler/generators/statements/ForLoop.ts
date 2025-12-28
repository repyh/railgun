import type { StatementGenerator } from '../../interfaces';

export const ForLoopGenerator: StatementGenerator = (node, ctx, processor) => {
    const bodyConn = processor.findConnection(node.id, 'body', 'out');
    const completedConn = processor.findConnection(node.id, 'completed', 'out');

    const start = processor.resolveInput(node, 'start', ctx) || '0';
    const end = processor.resolveInput(node, 'end', ctx) || '10';

    let updateStmt = 'i++';
    const updateFuncConn = processor.findConnection(node.id, 'updateFunc', 'in');
    if (updateFuncConn) {
        const funcNode = processor.getNode(updateFuncConn.source);
        if (funcNode && funcNode.label === 'Function Def') {
            const nameControl = funcNode.controls?.['name'] as any;
            const funcName = nameControl?.value || 'myFunc_' + funcNode.id.replace(/-/g, '_');
            updateStmt = `i = ${funcName}(i)`;
        }
    }

    let code = `for (let i = ${start}; i < ${end}; ${updateStmt}) {\n`;
    if (bodyConn) {
        const nextNode = processor.getNode(bodyConn.target);
        if (nextNode) code += processor.process(nextNode, '    ', ctx); // Indent + 4 spaces
    }
    code += `}\n`;

    if (completedConn) {
        const nextNode = processor.getNode(completedConn.target);
        if (nextNode) code += processor.process(nextNode, '', ctx); // No extra indent for completion
    }
    return code;
};
