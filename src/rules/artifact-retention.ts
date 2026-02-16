import { Rule, LintResult } from '../types';
import { findLineNumber } from '../parser';

export const artifactRetention: Rule = {
  name: 'artifact-retention',
  check(file, content, parsed) {
    const results: LintResult[] = [];
    if (!parsed?.jobs) return results;
    for (const [, job] of Object.entries<any>(parsed.jobs)) {
      for (const step of job?.steps ?? []) {
        if (!step.uses) continue;
        if (step.uses.startsWith('actions/upload-artifact@')) {
          if (!step.with?.['retention-days']) {
            results.push({
              file, line: findLineNumber(content, step.uses),
              severity: 'warning', rule: 'artifact-retention',
              message: 'Artifact upload without retention-days — defaults to 90 days',
              fix: 'Add `retention-days: 7` (or appropriate) to reduce storage costs'
            });
          }
        }
      }
    }
    return results;
  }
};
