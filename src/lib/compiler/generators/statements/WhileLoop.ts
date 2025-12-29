import type { StatementGenerator } from '../../interfaces';

export const WhileLoopGenerator: StatementGenerator = (node, ctx, processor) => {
    const condition = processor.resolveInput(node, 'condition', ctx) || 'false';
    const bodyConn = processor.findConnection(node.id, 'loopBody', 'out');
    const completedConn = processor.findConnection(node.id, 'completed', 'out');

    let code = `while (${condition}) {\n`;

    if (bodyConn) {
        const nextNode = processor.getNode(bodyConn.target);
        if (nextNode) {
            // Important: Indent the body
            code += processor.process(nextNode, '    ', ctx);
        }
    }

    code += `}\n`;

    if (completedConn) {
        const nextNode = processor.getNode(completedConn.target);
        if (nextNode) {
            code += processor.process(nextNode, '', ctx);
        }
    }

    return code;
};
