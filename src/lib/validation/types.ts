export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
    id: string; // Unique ID for the issue (usually ${nodeId}-${ruleId})
    nodeId: string;
    nodeLabel: string;
    severity: ValidationSeverity;
    message: string;
    ruleId: string; // e.g. 'cycle-detected', 'missing-input'
}

export interface GraphValidatorOptions {
    checkCycles?: boolean;
    checkReachability?: boolean;
    checkRequiredInputs?: boolean;
}
