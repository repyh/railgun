export interface CompilerConnection {
    id: string;
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
}

export interface CompilerSocket {
    name: string;
}

export interface CompilerInput {
    socket: CompilerSocket;
    label?: string;
}

export interface CompilerOutput {
    socket: CompilerSocket;
    label?: string;
}

export interface CompilerNode {
    id: string;
    label: string;
    category: string; // 'Event' | 'Action' | 'Logic' | etc.
    codeType: string; // Stable identifier for generators

    data: Record<string, any>;

    // Rete-compatible structure for parsers/validator
    inputs: Record<string, CompilerInput>;
    outputs: Record<string, CompilerOutput>;

    // Layout (optional but preserved for potential debugging/rendering)
    width?: number;
    height?: number;

    // Validation Metadata
    requiredInputs?: Set<string>;
    validationMessages?: Map<string, string>;

    /**
     * Optional custom validation logic.
     */
    validate?: (connections: CompilerConnection[]) => { id: string, message: string, severity: 'error' | 'warning' }[];
}
