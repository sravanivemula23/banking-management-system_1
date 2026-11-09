import api from './api';

export const transactionService = {
  /** -> TransactionResponse (201) */
  deposit: ({ accountId, amount, description }) =>
    api.post('/api/transactions/deposit', { accountId, amount, description: description || null }).then((r) => r.data),

  /** -> TransactionResponse (201) */
  withdraw: ({ accountId, amount, description }) =>
    api.post('/api/transactions/withdraw', { accountId, amount, description: description || null }).then((r) => r.data),

  /**
   * Paginated history for one account.
   * type: DEPOSIT | WITHDRAWAL | TRANSFER_DEBIT | TRANSFER_CREDIT (optional); direction: 'asc' | 'desc'
   * -> { content: TransactionResponse[], page, size, totalElements, totalPages, last }
   */
  history: (accountId, { type, page = 0, size = 10, direction = 'desc' } = {}) =>
    api
      .get(`/api/transactions/history/${accountId}`, { params: { type: type || undefined, page, size, direction } })
      .then((r) => r.data),

  /** Look up one transaction by its reference (transaction ID). */
  getByReference: (reference) =>
    api.get(`/api/transactions/reference/${encodeURIComponent(reference)}`).then((r) => r.data),
};
