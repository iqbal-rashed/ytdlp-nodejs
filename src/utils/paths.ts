import * as fs from 'fs';
import * as path from 'path';

function findPackageRoot(startDir: string): string {
  let current = startDir;

  while (true) {
    if (fs.existsSync(path.join(current, 'package.json'))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }
    current = parent;
  }
}

export const PACKAGE_ROOT = findPackageRoot(__dirname);
export const BIN_DIR = path.join(PACKAGE_ROOT, 'bin');
export const PACKAGE_JSON_PATH = path.join(PACKAGE_ROOT, 'package.json');
