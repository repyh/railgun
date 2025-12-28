import { BotNode } from '@/lib/railgun-rete';
import type { CompilerContext, StatementGenerator, Processor } from '../../interfaces';

export const BranchGenerator: StatementGenerator = (
    node: BotNode,
    ctx: CompilerContext,
    processor: Processor
): string => {
    const condition = processor.resolveInput(node, 'condition', ctx) || 'false';

    // Process True branch
    const trueConn = processor.findConnection(node.id, 'true', 'out');
    let trueBlock = '';
    if (trueConn) {
        const nextNode = processor.getNode(trueConn.target);
        if (nextNode) {
            trueBlock = processor.process(nextNode, '    ', ctx);
        }
    }

    // Process False branch
    const falseConn = processor.findConnection(node.id, 'false', 'out');
    let falseBlock = '';
    if (falseConn) {
        const nextNode = processor.getNode(falseConn.target);
        if (nextNode) {
            falseBlock = processor.process(nextNode, '    ', ctx);
        }
    }

    return `if (${condition}) {\n${trueBlock}\n} else {\n${falseBlock}\n}`;
};
