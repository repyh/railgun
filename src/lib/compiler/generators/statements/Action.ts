import type { StatementGenerator } from '../../interfaces';

const ACTION_STRATEGIES: Record<string, (node: any, ctx: any, processor: any) => string> = {
    'Send Message': (node, ctx, processor) => {
        const msg = processor.resolveInput(node, 'msg', ctx);
        if (ctx.interactionVar) {
            return `await ${ctx.interactionVar}.reply({ content: ${msg}, ephemeral: true });\n`;
        } else if (ctx.mainVar) {
            return `await ${ctx.mainVar}.channel.send(${msg});\n`;
        }
        return `// Error: No context for Send Message\n`;
    },
    'Send Embed': (node, ctx, processor) => {
        const title = processor.resolveInput(node, 'title', ctx) || '"No Title"';
        const desc = processor.resolveInput(node, 'desc', ctx) || '"No Description"';
        if (ctx.interactionVar) {
            return `await ${ctx.interactionVar}.reply({ embeds: [{ title: ${title}, description: ${desc} }] });\n`;
        } else if (ctx.mainVar) {
            return `await ${ctx.mainVar}.channel.send({ embeds: [{ title: ${title}, description: ${desc} }] });\n`;
        }
        return `// Error: No context for Send Embed\n`;
    },
    'Console Log': (node, ctx, processor) => {
        const msg = processor.resolveInput(node, 'msg', ctx);
        return `console.log(${msg});\n`;
    }
};

export const ActionGenerator: StatementGenerator = (node, ctx, processor) => {
    const strategy = ACTION_STRATEGIES[node.label];
    if (strategy) {
        return strategy(node, ctx, processor);
    }
    return `// Unknown Action: ${node.label}\n`;
};
