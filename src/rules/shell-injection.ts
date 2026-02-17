import { Rule, LintResult } from '../types';

const DANGEROUS_CONTEXTS = [
  'github.event.issue.title',
  'github.event.issue.body',
  'github.event.pull_request.title',
  'github.event.pull_request.body',
  'github.event.comment.body',
  'github.event.review.body',
  'github.event.discussion.title',
  'github.event.discussion.body',
  'github.event.pages.*.page_name',
  'github.event.commits.*.message',
  'github.event.commits.*.author.email',
  'github.event.commits.*.author.name',
  'github.event.head_commit.message',
  'github.event.head_commit.author.email',
  'github.event.head_commit.author.name',
  'github.head_ref',
];

const DANGEROUS_PATTERN = /\$\{\{\s*(github\.event\.\w+[\w.]*\.(?:title|body|message|name|email|page_name)|github\.head_ref)\s*\}\}/g;

export const shellInjection: Rule = {
  name: 'shell-injection',
  check(file, content) {
    const results: LintResult[] = [];
    const lines = content.split('\n');
    let inRun = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trimStart();

      if (trimmed.startsWith('run:') || trimmed.startsWith('run :')) {
        inRun = true;
      } else if (/^\s*\w+:/.test(line) && !line.match(/^\s+/)) {
        inRun = false;
      }

      if (inRun) {
        const matches = line.matchAll(DANGEROUS_PATTERN);
        for (const match of matches) {
          results.push({
            file, line: i + 1, severity: 'error', rule: 'shell-injection',
            message: `Potential shell injection via \`\${{ ${match[1]} }}\` in run step`,
            fix: 'Pass as an environment variable instead: `env: { VALUE: "${{ ... }}" }` then use `$VALUE`'
          });
        }
      }
    }
    return results;
  }
};
