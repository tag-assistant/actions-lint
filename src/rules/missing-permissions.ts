import { Rule, LintResult } from '../types';

export const missingPermissions: Rule = {
  name: 'missing-permissions',
  check(file, _content, parsed) {
    if (!parsed?.jobs) return [];
    if (parsed.permissions) return [];
    // Check if any job has permissions
    const jobsHavePerms = Object.values<any>(parsed.jobs).every(j => j?.permissions);
    if (jobsHavePerms) return [];
    return [{
      file, line: 1, severity: 'warning', rule: 'missing-permissions',
      message: 'Workflow has no explicit permissions block — defaults to broad read/write access',
      fix: 'Add top-level `permissions: {}` (least privilege) or specify needed permissions'
    }];
  }
};
