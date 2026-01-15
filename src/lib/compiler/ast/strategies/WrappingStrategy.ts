export type FileType = 'command' | 'slash_command' | 'event';

export interface WrappingMetadata {
    eventName: string;       // e.g. "ping" or "ready"
    eventParams: string[];   // e.g. ["message", "args"]
    isAsync: boolean;
    fileName?: string;
    description?: string;    // For Slash Commands
    options?: any[];         // For Slash Commands
    once?: boolean;          // For Events (e.g. valid for some events)
}

export interface WrapperStrategy {
    wrap(bodyCode: string, metadata: WrappingMetadata): string;
}

/**
 * Utility to properly indent multiline code blocks for templates.
 * Takes a code block (already standardized to 0-level indentation) and applies the target indentation.
 */
export function indentCode(code: string, spaces: number): string {
    if (!code) return '';

    // Split into lines first
    const lines = code.split(/\r?\n/);

    // Remove leading/trailing empty lines to keep templates tight
    while (lines.length > 0 && lines[0].trim() === '') lines.shift();
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

    const prefix = ' '.repeat(spaces);
    return lines.map(l => l.trim().length > 0 ? prefix + l : l).join('\n');
}
