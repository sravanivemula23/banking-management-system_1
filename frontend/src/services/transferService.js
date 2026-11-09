import api from './api';

export const transferService = {
  /**
   * The backend identifies accounts by numeric id (toAccountId), not by account number.
   * idempotencyKey makes a retried request safe: the backend returns the original transfer.
   * -> { transferId, fromAccountId, toAccountId, amount, status, createdAt } (201)
   */
  transfer: ({ fromAccountId, toAccountId, amount, description, idempotencyKey }) =>
    api
      .post('/api/transactions/transfer', {
        fromAccountId,
        toAccountId,
        amount,
        description: description || null,
        idempotencyKey,
      })
      .then((r) => r.data),
};
