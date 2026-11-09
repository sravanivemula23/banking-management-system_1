import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import { buildUserMessage } from '../utils/errors';

// Base URL comes from .env (VITE_API_BASE_URL). Nothing secret lives in the frontend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// AuthContext registers a callback here so that a 401 anywhere logs the user out.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

// Attach the JWT to every request (the token is never logged).
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = buildUserMessage(error);
    const status = error.response?.status;
    const isAuthCall = error.config?.url?.startsWith('/api/auth/');
    // 401 on a protected call = missing/expired/invalid token -> force logout.
    // (A 401 from /api/auth/login just means "wrong email or password", so it is shown on the form instead.)
    if (status === 401 && !isAuthCall && onUnauthorized) onUnauthorized();
    // 403 is passed through; pages show "You do not have permission..." via error.userMessage.
    return Promise.reject(error);
  },
);

export default api;
