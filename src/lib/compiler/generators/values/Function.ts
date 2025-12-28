import type { ValueGenerator } from '../../interfaces';

const FUNC_OUTPUT_strategies: Record<string, (node: any, key: string) => string> = {
    'Function Def': (node, key) => {
        if (key === 'arg0') return 'arg0';
        if (key === 'arg1') return 'arg1';
        if (key === 'arg2') return 'arg2';
        if (key === 'ret') return 'ret';
        if (key === 'fn') {
            const nameControl = node.controls?.['name'] as any;
            return nameControl?.value || 'myFunc_' + node.id.replace(/-/g, '_');
        }
        return 'undefined';
    },
    'Call Function': (node, key) => {
        if (key === 'result') {
            return `res_${node.id.replace(/-/g, '_')}`;
        }
        return 'undefined';
    }
};

//@ts-ignore
export const FunctionGenerator: ValueGenerator = (node, key, ctx, resolver) => {
    const strategy = FUNC_OUTPUT_strategies[node.label];
    if (strategy) {
        return strategy(node, key);
    }
    return '0';
};
