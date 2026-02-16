import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';
import { parseWorkflow } from './parser';
import { Rule, LintResult } from './types';
import { unpinnedActions } from './rules/unpinned-actions';
import { missingPermissions } from './rules/missing-permissions';
import { missingTimeout } from './rules/missing-timeout';
import { hardcodedSecrets } from './rules/hardcoded-secrets';
import { missingConcurrency } from './rules/missing-concurrency';
import { deprecatedActions } from './rules/deprecated-actions';
import { artifactRetention } from './rules/artifact-retention';
import { pullRequestTarget } from './rules/pull-request-target';

const rules: Rule[] = [
  unpinnedActions, missingPermissions, missingTimeout, hardcodedSecrets,
  missingConcurrency, deprecatedActions, artifactRetention, pullRequestTarget,
];

const SEVERITY_ICONS: Record<string, string> = {
  error: '❌', warning: '⚠️', info: 'ℹ️'
};

const SEVERITY_COLORS: Record<string, string> = {
  error: '\x1b[31m', warning: '\x1b[33m', info: '\x1b[36m'
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function getWorkflowDir(): string {
  // GitHub Action mode
  if (process.env.GITHUB_ACTIONS) {
    return core.getInput('path') || '.github/workflows';
  }
  // CLI mode
  return process.argv[2] || '.github/workflows';
}

function lintWorkflows(dir: string): LintResult[] {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir).filter(f => /\.ya?ml$/.test(f));
  if (files.length === 0) {
    console.log('No workflow files found.');
    return [];
  }

  const allResults: LintResult[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    let parsed: any;
    try {
      parsed = parseWorkflow(content);
    } catch (e: any) {
      allResults.push({
        file: filePath, line: 1, severity: 'error',
        rule: 'parse-error', message: `Failed to parse: ${e.message}`
      });
      continue;
    }

    for (const rule of rules) {
      allResults.push(...rule.check(filePath, content, parsed));
    }
  }

  return allResults;
}

function printResults(results: LintResult[]): void {
  if (results.length === 0) {
    console.log(`\n${BOLD}✅ All workflows look good!${RESET}\n`);
    return;
  }

  // Group by file
  const byFile = new Map<string, LintResult[]>();
  for (const r of results) {
    if (!byFile.has(r.file)) byFile.set(r.file, []);
    byFile.get(r.file)!.push(r);
  }

  console.log(`\n${BOLD}🔍 Actions Lint Results${RESET}\n`);

  for (const [file, fileResults] of byFile) {
    console.log(`${BOLD}${file}${RESET}`);
    for (const r of fileResults.sort((a, b) => a.line - b.line)) {
      const icon = SEVERITY_ICONS[r.severity];
      const color = SEVERITY_COLORS[r.severity];
      console.log(`  ${DIM}${r.line}:${RESET} ${color}${icon} ${r.severity}${RESET} [${r.rule}] ${r.message}`);
      if (r.fix) console.log(`     ${DIM}💡 ${r.fix}${RESET}`);
    }
    console.log();
  }

  const errors = results.filter(r => r.severity === 'error').length;
  const warnings = results.filter(r => r.severity === 'warning').length;
  const infos = results.filter(r => r.severity === 'info').length;
  console.log(`${BOLD}Found: ${errors} errors, ${warnings} warnings, ${infos} info${RESET}\n`);
}

function reportToGitHub(results: LintResult[]): void {
  for (const r of results) {
    const msg = `[${r.rule}] ${r.message}${r.fix ? ` — ${r.fix}` : ''}`;
    if (r.severity === 'error') core.error(msg, { file: r.file, startLine: r.line });
    else if (r.severity === 'warning') core.warning(msg, { file: r.file, startLine: r.line });
    else core.notice(msg, { file: r.file, startLine: r.line });
  }
}

// Main
const dir = getWorkflowDir();
const results = lintWorkflows(dir);
printResults(results);

if (process.env.GITHUB_ACTIONS) {
  reportToGitHub(results);
  const failOnError = core.getInput('fail-on-error') !== 'false';
  if (failOnError && results.some(r => r.severity === 'error')) {
    core.setFailed('Workflow lint errors found');
  }
} else {
  if (results.some(r => r.severity === 'error')) process.exit(1);
}
