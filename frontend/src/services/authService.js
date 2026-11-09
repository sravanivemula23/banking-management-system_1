import api from './api';

export const authService = {
  /** -> { token, tokenType, expiresInMs, user: { id, name, email, role, createdAt } } */
  login: (email, password) =>
    api.post('/api/auth/login', { email: email.trim(), password }).then((r) => r.data),

  /** -> UserResponse (201). Registration does not return a token: the user must log in afterwards. */
  register: ({ name, email, password }) =>
    api.post('/api/auth/register', { name: name.trim(), email: email.trim(), password }).then((r) => r.data),
};
