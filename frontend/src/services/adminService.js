import api from './api';

// All of these require ROLE_ADMIN; the backend enforces it (a customer gets 403).
export const adminService = {
  /** -> PageResponse<UserResponse> */
  getUsers: ({ page = 0, size = 10 } = {}) => api.get('/api/admin/users', { params: { page, size } }).then((r) => r.data),

  /** -> PageResponse<AccountResponse> */
  getAccounts: ({ page = 0, size = 10 } = {}) =>
    api.get('/api/admin/accounts', { params: { page, size } }).then((r) => r.data),

  /** status: 'ACTIVE' | 'INACTIVE' -> AccountResponse */
  updateAccountStatus: (id, status) => api.put(`/api/admin/accounts/${id}/status`, { status }).then((r) => r.data),

  /** -> PageResponse<TransactionResponse> */
  getTransactions: ({ type, page = 0, size = 10, direction = 'desc' } = {}) =>
    api.get('/api/admin/transactions', { params: { type: type || undefined, page, size, direction } }).then((r) => r.data),
};
