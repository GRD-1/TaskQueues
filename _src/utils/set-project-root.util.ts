import path from 'path';
import { fileURLToPath } from 'url';

/**
 * the Node.js global variables __dirname and __filename are not supported by ES module scope
 * this functions allows us to replace it and fix this problem
 */
function getFilename(metaUrl: string): string {
  return fileURLToPath(metaUrl);
}
function getDirname(metaUrl: string): string {
  return path.dirname(getFilename(metaUrl));
}
function setProjectRoot(): string {
  process.env.PROJECT_ROOT = getDirname(`${import.meta.url}/../../`);
  return process.env.PROJECT_ROOT;
}
export default setProjectRoot();
