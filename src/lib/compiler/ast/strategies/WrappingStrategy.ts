export type FileType = 'command' | 'slash_command' | 'event';

export interface WrappingMetadata {
    eventName: string;       // e.g. "ping" or "ready"
    eventParams: string[];   // e.g. ["message", "args"]
    isAsync: boolean;
    fileName?: string;
    description?: string;    // For Slash Commands
    once?: boolean;          // For Events (e.g. valid for some events)
}

export interface WrapperStrategy {
    wrap(bodyCode: string, metadata: WrappingMetadata): string;
}
