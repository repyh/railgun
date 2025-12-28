import { BotNode, InputControl } from '@/lib/railgun-rete';
import type { CompilerContext, ValueGenerator, Resolver } from '../../interfaces';

export const LogicOpGenerator: ValueGenerator = (
    node: BotNode,
    _outputKey: string,
    ctx: CompilerContext,
    resolver: Resolver
): string => {
    const a = resolver.resolve(node, 'a', ctx) || 'false';
    const b = resolver.resolve(node, 'b', ctx) || 'false';
    const control = node.controls.op as InputControl;
    const op = control?.value || '&&';

    return `(${a} ${op} ${b})`;
};
