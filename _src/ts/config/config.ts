// eslint-disable-next-line import/no-unresolved
import { getDirname } from './config-functions';

export default function getVariables() {
  process.env.Project_ROOT = getDirname(`${import.meta.url}/../../../`);
}
