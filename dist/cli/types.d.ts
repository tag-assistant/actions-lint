export interface LintResult {
    file: string;
    line: number;
    severity: 'error' | 'warning' | 'info';
    rule: string;
    message: string;
    fix?: string;
}
export interface Rule {
    name: string;
    check(file: string, content: string, parsed: any): LintResult[];
}
