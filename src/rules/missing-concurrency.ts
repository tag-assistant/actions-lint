import { Rule } from '../types';

export const missingConcurrency: Rule = {
  name: 'missing-concurrency',
  check(file, _content, parsed) {
    if (!parsed) return [];
    if (parsed.concurrency) return [];
    return [{
      file, line: 1, severity: 'info', rule: 'missing-concurrency',
      message: 'No concurrency group — duplicate workflow runs won\'t be cancelled',
      fix: 'Add `concurrency: { group: "${{ github.workflow }}-${{ github.ref }}", cancel-in-progress: true }`'
    }];
  }
};
