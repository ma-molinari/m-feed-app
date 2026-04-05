import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (existsSync('.git')) {
  try {
    execSync('husky', { stdio: 'inherit' });
  } catch {
    /* ignore */
  }
}
