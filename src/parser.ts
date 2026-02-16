import * as yaml from 'js-yaml';

export function parseWorkflow(content: string): any {
  return yaml.load(content);
}

export function findLineNumber(content: string, search: string): number {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(search)) return i + 1;
  }
  return 1;
}
