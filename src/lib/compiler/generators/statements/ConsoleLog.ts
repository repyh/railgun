import type { StatementGenerator, CompilerContext, Processor } from '../../interfaces';
import type { BotNode } from '../../../railgun-rete';

export const ConsoleLogGenerator: StatementGenerator = (node: BotNode, ctx: CompilerContext, processor: Processor) => {
    const message = processor.resolveInput(node, 'msg', ctx);
    // Default to empty string if no message
    const finalMsg = message ? message : `''`;
    return `console.log(${finalMsg});`;
};
