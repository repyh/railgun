import { BotNode, InputControl } from '@/lib/railgun-rete';
import type { CompilerContext, ValueGenerator } from '../../interfaces';
import type { Resolver } from '../../interfaces';

export const ObjectAccessorGenerator: ValueGenerator = (
    node: BotNode,
    _outputKey: string,
    ctx: CompilerContext,
    resolver: Resolver
): string => {
    // Input 'object' (Any)
    const objectInput = resolver.resolve(node, 'object', ctx) || 'null';

    // Control 'property'
    const control = node.controls.property as InputControl;
    const propertyPath = control?.value || '';

    if (propertyPath.includes('.')) {
        // "author.username" -> object?.author?.username
        const chain = propertyPath.split('.').join('?.');
        return `${objectInput}?.${chain}`;
    }

    // Default safe access
    return `${objectInput}?.['${propertyPath}']`;
};
