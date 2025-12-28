import { BotNode } from '@/lib/railgun-rete';
import type { CompilerContext, ValueGenerator, Resolver } from '../../interfaces';

export const PowerGenerator: ValueGenerator = (
    node: BotNode,
    _outputKey: string,
    ctx: CompilerContext,
    resolver: Resolver
): string => {
    const base = resolver.resolve(node, 'base', ctx) || '0';
    const exponent = resolver.resolve(node, 'exponent', ctx) || '1';

    return `Math.pow(${base}, ${exponent})`;
};
