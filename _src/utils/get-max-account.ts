import { Account } from '../models/max-balance.model';

export default function getMaxAccount(...args: Account[]): Account {
  args.sort((a, b) => {
    const item1 = Number.isNaN(Math.abs(Object.values(a)[0])) ? 0 : Math.abs(Object.values(a)[0]);
    const item2 = Number.isNaN(Math.abs(Object.values(b)[0])) ? 0 : Math.abs(Object.values(b)[0]);
    if (item1 === item2) return 0;
    return item1 < item2 ? 1 : -1;
  });
  return args[0];
}
