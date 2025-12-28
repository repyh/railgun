import { BotNode, InputControl } from '@/lib/railgun-rete';
import type { CompilerContext, StatementGenerator, Processor } from '../../interfaces';

export const MathAssignmentGenerator: StatementGenerator = (
    node: BotNode,
    ctx: CompilerContext,
    processor: Processor
): string => {
    const varName = processor.resolveInput(node, 'variable', ctx);
    const value = processor.resolveInput(node, 'value', ctx) || '0';

    const control = node.controls.op as InputControl;
    const op = control?.value || '+=';

    return `${varName} ${op} ${value};\n`;
};
