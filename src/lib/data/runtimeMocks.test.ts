import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const runtimeRoots = ['src/features', 'src/components'];
const testFilePattern = /\.(test|spec)\.(ts|tsx)$/;
const disallowedPatterns = [
  /@\/lib\/mocks/,
  /@\/lib\/data\/withFallback/,
  /MockDataBadge/,
];

function collectSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      return collectSourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe('runtime API data flow', () => {
  it('does not wire page/component data loads through mock fallbacks', () => {
    const offenders = runtimeRoots
      .flatMap(collectSourceFiles)
      .map((file) => relative(process.cwd(), file).replace(/\\/g, '/'))
      .filter((file) => !testFilePattern.test(file))
      .filter((file) => {
        const contents = readFileSync(file, 'utf8');
        return disallowedPatterns.some((pattern) => pattern.test(contents));
      });

    expect(offenders).toEqual([]);
  });
});
