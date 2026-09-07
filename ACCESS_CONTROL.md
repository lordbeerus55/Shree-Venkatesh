# Dashboard access control

## Account types

| Role | Created from | Purpose |
|---|---|---|
| `ADMIN` | Initial deployment or existing administrator | Full dashboard administration |
| `VIEWER` | **Dashboard Users** page | Trusted staff account with read-only dashboard access |

Customer records under **Customer Users** are separate from dashboard accounts. A customer mobile number and MPIN do not grant dashboard access. This separation prevents customers from seeing other users' financial and personal data.

## Permission matrix

| Area | Viewer | Admin |
|---|---|---|
| Dashboard statistics | View and filter | View and filter |
| Customer users and details | View, search, paginate | View plus create, edit, delete, block/unblock |
| Dashboard users | No access | List, create viewers, reset passwords, delete viewers |
| Customer wallets | View balances and transactions | View plus add or withdraw points |
| System, deposit, withdrawal, sell and transaction reports | View and filter | View and filter |
| Markets and schedules | View | View plus create, edit and delete |
| Game rates | View | View and update |
| Results and history | View | View plus declare, generate and update |
| Bids and predictions | View and filter | View and filter plus revert bids |
| Deposit requests | View | View plus approve or reject |
| Withdrawal requests | View | View plus approve or reject |
| Notifications | View | View plus create, edit and delete |
| Slider images | View | View plus upload and delete |
| Settings, contents, contact details and timings | View | View and update |
| Payment methods | View | View plus create, edit and delete |
| Own password | Change | Change |
| Logout | Allowed | Allowed |

## Enforcement

The backend is the authorization boundary. Every protected API request validates the signed token and reloads the current account role and token version from PostgreSQL. `GET`, `HEAD` and `OPTIONS` requests are available to both roles; all other administrative API methods return HTTP `403` for `VIEWER`, except the authenticated change-password endpoint. Dashboard-account management requires `ADMIN` even for reads.

The frontend uses the returned role to show a read-only indicator and remove or disable mutation controls. Frontend restrictions are only a usability layer and do not replace backend authorization. JWTs are kept in browser memory rather than persistent web storage, so refreshing the page requires signing in again. Changing or resetting a password revokes existing tokens for that account.

## Railway deployment

The backend build generates Prisma Client and compiles TypeScript. Railway applies committed migrations with `prisma migrate deploy` before deployment; startup verifies PostgreSQL connectivity, secures legacy customer MPIN values, creates an initial administrator only for an empty deployment, and starts Express. The role migration defaults every existing dashboard account to `ADMIN`, preserving the current administrator.

Required backend variables:

- `DATABASE_URL=${{ Postgres.DATABASE_PRIVATE_URL }}`
- `JWT_SECRET` with at least 32 random bytes
- `NODE_ENV=production`
- `PORT` supplied by Railway

For a new empty database, also set `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD`. The initial password must contain at least 12 characters. Existing deployments that already contain an administrator do not require these two bootstrap variables.

Railway deploys the backend from `shree-venkatesh-backend` and the frontend from `Shree-Venkatesh`. Push and verify both repositories independently. After backend deployment, existing sessions must sign in again because updated JWT validation requires issuer, audience, subject and token-version claims.
