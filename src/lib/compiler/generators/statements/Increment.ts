import { BotNode, InputControl } from '@/lib/railgun-rete';
import type { CompilerContext, StatementGenerator, Processor } from '../../interfaces';

export const IncrementGenerator: StatementGenerator = (
    node: BotNode,
    ctx: CompilerContext,
    processor: Processor
): string => {
    const varName = processor.resolveInput(node, 'variable', ctx);

    const control = node.controls.op as InputControl;
    const op = control?.value || '++';

    return `${varName}${op};\n`;
};
