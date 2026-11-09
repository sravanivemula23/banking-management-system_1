# Banking Management System: React Frontend

React 18 + Vite + Tailwind CSS client for the Spring Boot backend in the parent folder.
Customer portal and admin console, light/dark mode, responsive down to phone width.

## Run it

Prerequisites: Node.js 18+ (20 or 22 recommended), the backend running (default `http://localhost:8081`).

```bash
cd frontend
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

Open **http://localhost:5173**. Production build: `npm run build` (output in `dist/`), preview with `npm run preview`.

### Backend requirements

1. **Port.** `.env` points to `http://localhost:8081`. If your backend runs on another port, change `VITE_API_BASE_URL`.
2. **CORS.** The browser blocks calls to a different origin unless the backend allows it. This project adds
   `config/CorsConfig.java` and one line (`.cors(Customizer.withDefaults())`) in `SecurityConfig.java`.
   It allows `http://localhost:5173` by default. To allow another origin set the environment variable
   `CORS_ALLOWED_ORIGINS` (comma separated) or the property `app.cors.allowed-origins`.
   Restart the backend after pulling these two changes.
3. **Admin login.** Start the backend with `ADMIN_EMAIL` and `ADMIN_PASSWORD` set; that seeds the admin user.

## Folder structure

```
src/
  services/      api.js (Axios client + interceptors) and one file per backend area
  context/       AuthContext (session, auto-logout), ThemeContext (dark mode)
  hooks/         useFetch (loading/error/data), useMyAccounts
  components/    common/ (Button, Input, Modal, Pagination...), layout/, dashboard/, accounts/, transactions/
  pages/         auth/, dashboard/, accounts/, transactions/, transfers/, profile/, admin/
  utils/         format, validators (mirror backend rules), errors, analytics, tokenStorage
```

## API mapping (verified against the backend source)

| Screen | Endpoint |
|---|---|
| Login / Register | `POST /api/auth/login`, `POST /api/auth/register` |
| Accounts list, create, details, balance | `GET /api/accounts/my-accounts`, `POST /api/accounts`, `GET /api/accounts/{id}`, `GET /api/accounts/{id}/balance` |
| Deposit & Withdraw | `POST /api/transactions/deposit`, `POST /api/transactions/withdraw` |
| Transfer | `POST /api/transactions/transfer` (sends an `idempotencyKey`) |
| Transaction history (filter, sort, pagination) | `GET /api/transactions/history/{accountId}?type=&page=&size=&direction=` |
| Find by transaction ID | `GET /api/transactions/reference/{reference}` |
| Admin users / accounts / transactions | `GET /api/admin/users`, `GET /api/admin/accounts`, `GET /api/admin/transactions` |
| Activate / deactivate account | `PUT /api/admin/accounts/{id}/status` |

## Backend gaps (the UI works around them, nothing is faked)

| Gap | How the frontend handles it | Suggested backend addition |
|---|---|---|
| Transfers need the recipient's numeric **account ID**, not the account number. | The form asks for "Recipient account ID" and explains where to find it (account details page). | `GET /api/accounts/lookup?accountNumber=...` returning id and holder name, or accept `toAccountNumber` in `TransferRequest`. |
| No `GET /api/auth/me`. | Profile uses the `user` object returned by login. | `GET /api/auth/me`. |
| No "all my transactions" endpoint. | Dashboard and chart merge the latest 50 transactions of each of your accounts. | `GET /api/transactions/my`. |
| No admin statistics endpoint. | Totals come from `totalElements` of the list endpoints; breakdowns use the latest 100 rows. | `GET /api/admin/stats`. |
| No user search. | Admin Users filter applies to the current page only. | `?q=` parameter on `/api/admin/users`. |

## Security notes

- The JWT is stored in `sessionStorage` (cleared when the tab closes) and sent as `Authorization: Bearer`. It is never logged.
  Any browser storage is readable by injected scripts (XSS); React escapes output by default and no raw HTML is rendered.
  An httpOnly cookie would be stronger but needs backend changes.
- The token's `exp` is read client-side to log out automatically; any `401` from a protected call also logs out.
- Route guards and role-based menus are convenience only. The backend enforces authorization (a customer calling an admin API gets `403`).
- Passwords are only held in form state while typing. `.env` is git-ignored; only `VITE_*` values reach the browser, so never put secrets in them.

## Tested

The UI was exercised end to end in a real browser (Chromium) against a mock server returning the same JSON shapes as the backend DTOs:
register, login, validation, account creation, deposit, withdraw, transfer with confirmation, history filter and search, admin deactivation,
role redirects and mobile layout. Please also run it once against your real backend.
