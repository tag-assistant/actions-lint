import { Rule, LintResult } from '../types';

const DEPRECATED_PATTERNS = [
  { pattern: /::set-output\s+name=/, message: '`::set-output` is deprecated', fix: 'Use `echo "name=value" >> $GITHUB_OUTPUT` instead' },
  { pattern: /::save-state\s+name=/, message: '`::save-state` is deprecated', fix: 'Use `echo "name=value" >> $GITHUB_STATE` instead' },
  { pattern: /set-output\s+name=/, message: '`set-output` command is deprecated', fix: 'Use `echo "name=value" >> $GITHUB_OUTPUT` instead' },
  { pattern: /save-state\s+name=/, message: '`save-state` command is deprecated', fix: 'Use `echo "name=value" >> $GITHUB_STATE` instead' },
];

export const deprecatedFeatures: Rule = {
  name: 'deprecated-features',
  check(file, content) {
    const results: LintResult[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith('#')) continue;
      for (const { pattern, message, fix } of DEPRECATED_PATTERNS) {
        if (pattern.test(line)) {
          results.push({
            file, line: i + 1, severity: 'warning', rule: 'deprecated-features',
            message, fix
          });
          break;
        }
      }
    }
    return results;
  }
};
