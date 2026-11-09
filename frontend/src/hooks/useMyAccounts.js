import { accountService } from '../services/accountService';
import { useFetch } from './useFetch';

const EMPTY = []; // stable reference so effects depending on `accounts` don't re-run every render

/** The logged-in customer's accounts (GET /api/accounts/my-accounts). */
export function useMyAccounts() {
  const { data, ...rest } = useFetch(() => accountService.getMyAccounts(), []);
  return { accounts: data ?? EMPTY, ...rest };
}
