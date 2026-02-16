import { Rule, LintResult } from '../types';
import { findLineNumber } from '../parser';

export const missingTimeout: Rule = {
  name: 'missing-timeout',
  check(file, content, parsed) {
    const results: LintResult[] = [];
    if (!parsed?.jobs) return results;
    for (const [name, job] of Object.entries<any>(parsed.jobs)) {
      if (!job?.['timeout-minutes']) {
        results.push({
          file, line: findLineNumber(content, `${name}:`),
          severity: 'warning', rule: 'missing-timeout',
          message: `Job "${name}" has no timeout-minutes — could run indefinitely`,
          fix: 'Add `timeout-minutes: 30` (or appropriate limit) to the job'
        });
      }
    }
    return results;
  }
};
