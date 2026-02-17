#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { parseWorkflow } from './parser';
import { Rule, LintResult } from './types';
import { unpinnedActions } from './rules/unpinned-actions';
import { missingPermissions } from './rules/missing-permissions';
import { missingTimeout } from './rules/missing-timeout';
import { hardcodedSecrets } from './rules/hardcoded-secrets';
import { missingConcurrency } from './rules/missing-concurrency';
import { deprecatedActions } from './rules/deprecated-actions';
import { deprecatedFeatures } from './rules/deprecated-features';
import { artifactRetention } from './rules/artifact-retention';
import { pullRequestTarget } from './rules/pull-request-target';
import { shellInjection } from './rules/shell-injection';
import { largeCheckoutDepth } from './rules/large-checkout-depth';

const rules: Rule[] = [
  unpinnedActions, missingPermissions, missingTimeout, hardcodedSecrets,
  missingConcurrency, deprecatedActions, deprecatedFeatures, artifactRetention,
  pullRequestTarget, shellInjection, largeCheckoutDepth,
];

const SEVERITY_ICONS: Record<string, string> = { error: '❌', warning: '⚠️', info: 'ℹ️' };
const SEVERITY_COLORS: Record<string, string> = { error: '\x1b[31m', warning: '\x1b[33m', info: '\x1b[36m' };
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function usage(): void {
  console.log(`
${BOLD}actions-lint${RESET} — Lint GitHub Actions workflow files

${BOLD}Usage:${RESET}
  actions-lint [path]           Lint workflows in directory (default: .github/workflows)
  actions-lint --help           Show this help
  actions-lint --version        Show version

${BOLD}Examples:${RESET}
  actions-lint
  actions-lint .github/workflows/
  actions-lint my-workflow.yml
`);
}

function getVersion(): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

function collectFiles(target: string): string[] {
  if (!fs.existsSync(target)) {
    console.error(`${BOLD}Error:${RESET} Path not found: ${target}`);
    process.exit(1);
  }
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target)
    .filter(f => /\.ya?ml$/.test(f))
    .map(f => path.join(target, f));
}

function lint(files: string[]): LintResult[] {
  const results: LintResult[] = [];
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let parsed: any;
    try {
      parsed = parseWorkflow(content);
    } catch (e: any) {
      results.push({ file: filePath, line: 1, severity: 'error', rule: 'parse-error', message: `Failed to parse: ${e.message}` });
      continue;
    }
    for (const rule of rules) {
      results.push(...rule.check(filePath, content, parsed));
    }
  }
  return results;
}

function printResults(results: LintResult[]): void {
  if (results.length === 0) {
    console.log(`\n${BOLD}✅ All workflows look good!${RESET}\n`);
    return;
  }
  const byFile = new Map<string, LintResult[]>();
  for (const r of results) {
    if (!byFile.has(r.file)) byFile.set(r.file, []);
    byFile.get(r.file)!.push(r);
  }
  console.log(`\n${BOLD}🔍 Actions Lint Results${RESET}\n`);
  for (const [file, fileResults] of byFile) {
    console.log(`${BOLD}${file}${RESET}`);
    for (const r of fileResults.sort((a, b) => a.line - b.line)) {
      const color = SEVERITY_COLORS[r.severity];
      console.log(`  ${DIM}${r.line}:${RESET} ${color}${SEVERITY_ICONS[r.severity]} ${r.severity}${RESET} [${r.rule}] ${r.message}`);
      if (r.fix) console.log(`     ${DIM}💡 ${r.fix}${RESET}`);
    }
    console.log();
  }
  const errors = results.filter(r => r.severity === 'error').length;
  const warnings = results.filter(r => r.severity === 'warning').length;
  const infos = results.filter(r => r.severity === 'info').length;
  console.log(`${BOLD}Found: ${errors} errors, ${warnings} warnings, ${infos} info${RESET}\n`);
}

// Main
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }
if (args.includes('--version') || args.includes('-v')) { console.log(getVersion()); process.exit(0); }

const target = args[0] || '.github/workflows';
const files = collectFiles(target);
if (files.length === 0) { console.log('No workflow files found.'); process.exit(0); }

const results = lint(files);
printResults(results);
if (results.some(r => r.severity === 'error')) process.exit(1);
