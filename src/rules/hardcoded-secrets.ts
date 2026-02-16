import { Rule, LintResult } from '../types';
import { findLineNumber } from '../parser';

const SECRET_PATTERNS = [
  /(?:password|secret|token|key|api_key)\s*[:=]\s*['"][^${}]+['"]/i,
  /ghp_[a-zA-Z0-9]{36}/,
  /gho_[a-zA-Z0-9]{36}/,
  /github_pat_[a-zA-Z0-9_]{82}/,
  /sk-[a-zA-Z0-9]{48}/,
  /AKIA[0-9A-Z]{16}/,
];

export const hardcodedSecrets: Rule = {
  name: 'hardcoded-secrets',
  check(file, content) {
    const results: LintResult[] = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith('#')) continue;
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(line)) {
          results.push({
            file, line: i + 1, severity: 'error', rule: 'hardcoded-secrets',
            message: 'Possible hardcoded secret detected',
            fix: 'Use `${{ secrets.SECRET_NAME }}` instead'
          });
          break;
        }
      }
    }
    return results;
  }
};
