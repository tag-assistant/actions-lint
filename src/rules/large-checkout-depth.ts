import { Rule, LintResult } from '../types';
import { findLineNumber } from '../parser';

export const largeCheckoutDepth: Rule = {
  name: 'large-checkout-depth',
  check(file, content, parsed) {
    const results: LintResult[] = [];
    if (!parsed?.jobs) return results;

    for (const [, job] of Object.entries<any>(parsed.jobs)) {
      for (const step of job?.steps ?? []) {
        if (!step.uses || !step.uses.startsWith('actions/checkout@')) continue;
        if (step.with?.['fetch-depth'] === 0 || step.with?.['fetch-depth'] === '0') {
          results.push({
            file, line: findLineNumber(content, 'fetch-depth'),
            severity: 'warning', rule: 'large-checkout-depth',
            message: '`fetch-depth: 0` clones entire git history — slow for large repos',
            fix: 'Use a specific depth or omit for shallow clone (default: 1)'
          });
        }
      }
    }
    return results;
  }
};
