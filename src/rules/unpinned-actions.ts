import { Rule, LintResult } from '../types';
import { findLineNumber } from '../parser';

export const unpinnedActions: Rule = {
  name: 'unpinned-actions',
  check(file, content, parsed) {
    const results: LintResult[] = [];
    if (!parsed?.jobs) return results;

    for (const [, job] of Object.entries<any>(parsed.jobs)) {
      for (const step of job?.steps ?? []) {
        if (!step.uses || typeof step.uses !== 'string') continue;
        const uses = step.uses;
        // Skip local actions and docker
        if (uses.startsWith('./') || uses.startsWith('docker://')) continue;
        const ref = uses.split('@')[1];
        if (!ref) continue;
        // SHA pins are 40 hex chars
        const isSHA = /^[a-f0-9]{40}$/.test(ref);
        const isSemver = /^v\d+/.test(ref);
        if (!isSHA && !isSemver) {
          results.push({
            file, line: findLineNumber(content, uses),
            severity: 'error', rule: 'unpinned-actions',
            message: `Action "${uses}" uses branch ref "${ref}" instead of a version tag or SHA`,
            fix: `Pin to a version tag (e.g., @v4) or full SHA for security`
          });
        }
      }
    }
    return results;
  }
};
