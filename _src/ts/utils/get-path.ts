/**
 * the Node.js global variables __dirname and __filename are not supported by ES module scope
 * this functions allows us to replace it and fix this problem
 */

import path from 'path';
import { fileURLToPath } from 'url';

export function getFilename(metaUrl: string): string {
  return fileURLToPath(metaUrl);
}

export function getDirname(metaUrl: string): string {
  return path.dirname(getFilename(metaUrl));
}
