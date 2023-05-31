// eslint-disable-next-line import/no-unresolved
import { getDirname } from './config-functions';

export default function getVariables() {
  process.env.Project_ROOT = getDirname(`${import.meta.url}/../../../`);
  process.env.apikey = 'K1MEAS8TXKRNKIY54INFYGV57118D1JABP';
}
