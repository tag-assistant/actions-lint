import { Rule, LintResult } from '../types';
import { findLineNumber } from '../parser';

const DEPRECATED: Record<string, string> = {
  'actions/create-release': 'Use softprops/action-gh-release instead',
  'actions/upload-release-asset': 'Use softprops/action-gh-release instead',
  'actions-rs/toolchain': 'Use dtolnay/rust-toolchain instead',
};

export const deprecatedActions: Rule = {
  name: 'deprecated-actions',
  check(file, content, parsed) {
    const results: LintResult[] = [];
    if (!parsed?.jobs) return results;
    for (const [, job] of Object.entries<any>(parsed.jobs)) {
      for (const step of job?.steps ?? []) {
        if (!step.uses) continue;
        const action = step.uses.split('@')[0];
        if (DEPRECATED[action]) {
          results.push({
            file, line: findLineNumber(content, step.uses),
            severity: 'warning', rule: 'deprecated-actions',
            message: `Action "${action}" is deprecated`,
            fix: DEPRECATED[action]
          });
        }
      }
    }
    return results;
  }
};
