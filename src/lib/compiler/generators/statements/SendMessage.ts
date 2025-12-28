import type { StatementGenerator } from '../../interfaces';

export const SendMessageGenerator: StatementGenerator = (node, ctx, processor) => {
    // Resolve inputs
    const target = processor.resolveInput(node, 'target', ctx);
    const content = processor.resolveInput(node, 'content', ctx);
    const embed = processor.resolveInput(node, 'embeds', ctx); // Single embed for now
    const component = processor.resolveInput(node, 'components', ctx); // Single row for now

    let actualTarget = target;
    if (!target || target === 'undefined' || target === 'null') {
        if (ctx.interactionVar) {
            actualTarget = ctx.interactionVar;
        } else {
            actualTarget = 'message.channel'; // Legacy command default
        }
    }

    // Build Options Object
    const optionsProps: string[] = [];

    if (content && content !== "''" && content !== 'undefined') {
        optionsProps.push(`content: ${content}`);
    }

    if (embed && embed !== 'undefined' && embed !== 'null') {
        // Wrap in array
        optionsProps.push(`embeds: [${embed}]`);
    }

    if (component && component !== 'undefined' && component !== 'null') {
        // Wrap in array
        optionsProps.push(`components: [${component}]`);
    }

    if (optionsProps.length === 0) {
        // Nothing to send
        return '';
    }

    const optionsObj = `{ ${optionsProps.join(', ')} }`;

    if (actualTarget === ctx.interactionVar) {
        return `await ${actualTarget}.reply(${optionsObj});\n`;
    }

    // Default to .send() for channels
    return `await ${actualTarget}.send(${optionsObj});\n`;
};
