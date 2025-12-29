import type { StatementGenerator } from '../../interfaces';

export const WaitGenerator: StatementGenerator = (node, ctx, processor) => {
    // Default to 1000ms if not resolved
    const duration = processor.resolveInput(node, 'duration', ctx) || '1000';
    const completedConn = processor.findConnection(node.id, 'completed', 'out');

    let code = `await new Promise(resolve => setTimeout(resolve, ${duration}));\n`;

    if (completedConn) {
        const nextNode = processor.getNode(completedConn.target);
        if (nextNode) {
            code += processor.process(nextNode, '', ctx);
        }
    }

    return code;
};
