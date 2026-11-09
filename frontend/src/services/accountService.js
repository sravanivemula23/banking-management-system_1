import api from './api';

export const accountService = {
  /** accountType: 'SAVINGS' | 'CURRENT'; initialDeposit optional. -> AccountResponse (201) */
  create: ({ accountType, initialDeposit }) =>
    api.post('/api/accounts', { accountType, initialDeposit: initialDeposit ?? null }).then((r) => r.data),

  /** -> AccountResponse[] */
  getMyAccounts: () => api.get('/api/accounts/my-accounts').then((r) => r.data),

  /** -> { id, accountNumber, userId, ownerName, accountType, balance, status, createdAt } */
  getById: (id) => api.get(`/api/accounts/${id}`).then((r) => r.data),

  /** -> { accountId, accountNumber, balance } */
  getBalance: (id) => api.get(`/api/accounts/${id}/balance`).then((r) => r.data),
};
