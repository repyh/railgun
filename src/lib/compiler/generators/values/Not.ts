import { BotNode } from '@/lib/railgun-rete';
import type { CompilerContext, ValueGenerator, Resolver } from '../../interfaces';

export const NotGenerator: ValueGenerator = (
    node: BotNode,
    _outputKey: string,
    ctx: CompilerContext,
    resolver: Resolver
): string => {
    const val = resolver.resolve(node, 'value', ctx) || 'false';
    return `!(${val})`;
};
