import { Rule, LintResult } from '../types';
import { findLineNumber } from '../parser';

export const pullRequestTarget: Rule = {
  name: 'pull-request-target',
  check(file, content, parsed) {
    if (!parsed?.on) return [];
    const triggers = typeof parsed.on === 'string' ? [parsed.on] : 
                     Array.isArray(parsed.on) ? parsed.on : Object.keys(parsed.on);
    if (!triggers.includes('pull_request_target')) return [];
    
    // Check if any job checks out PR code (dangerous combo)
    const results: LintResult[] = [];
    const hasCheckout = content.includes('actions/checkout') && 
      (content.includes('github.event.pull_request.head') || content.includes('head.ref'));
    
    results.push({
      file, line: findLineNumber(content, 'pull_request_target'),
      severity: hasCheckout ? 'error' : 'warning',
      rule: 'pull-request-target',
      message: hasCheckout 
        ? 'pull_request_target with PR head checkout — HIGH SECURITY RISK (code injection)'
        : 'pull_request_target trigger requires careful security review',
      fix: 'Prefer pull_request trigger, or ensure no untrusted code is executed'
    });
    return results;
  }
};
