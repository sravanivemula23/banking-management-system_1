// The JWT is kept in sessionStorage: it is cleared when the tab closes and is not shared between tabs.
// Trade-off (worth knowing for interviews): any browser storage is readable by injected JavaScript (XSS).
// React escapes output by default, and we never render raw HTML, which keeps that risk low.
// The most hardened option is an httpOnly cookie, which would need backend changes.

const TOKEN_KEY = 'bank.token';
const USER_KEY = 'bank.user';

function safe(fn, fallback = null) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export const tokenStorage = {
  get: () => safe(() => sessionStorage.getItem(TOKEN_KEY)),
  getUser: () => safe(() => JSON.parse(sessionStorage.getItem(USER_KEY))),
  save: (token, user) =>
    safe(() => {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }),
  clear: () =>
    safe(() => {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }),
};

/** Returns the token's expiry time in ms since epoch, or null if it cannot be read. */
export function getTokenExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(payload));
    return json.exp ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}
