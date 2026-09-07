# Functional Test Report

**Project:** Shree Venkatesh admin dashboard and customer game application  
**Date:** 2026-09-07  
**Frontend repository:** `lordbeerus55/Shree-Venkatesh`  
**Backend repository:** `lordbeerus55/shree-venkatesh-backend`

## 1. Final architecture

Customer and staff accounts are intentionally different security contexts, but each customer now has one unified customer identity.

### Staff accounts

- `ADMIN`: full dashboard access.
- `VIEWER`: trusted staff account with read-only dashboard access.
- Staff authenticate through `/api/auth/login`.
- Staff can inspect operational data for all customers.

### Customer accounts

A customer is one `User` row containing:

- Name
- Mobile number
- Hashed 4-digit MPIN
- Unique username
- Hashed password
- Wallet and reserved withdrawal balance
- Active/banned status
- Token version and login-lock state

New customers are created by an administrator from **Customer Users**. A customer can sign into the game using either:

- Username and password, or
- Mobile number and MPIN

Customers authenticate through `/api/customer/auth/login` and can access only `/api/customer/*`. Customer IDs are derived from the signed customer token. Customer endpoints reject a supplied `userId`, so one customer cannot select another customer's wallet, bids, deposits, or withdrawals.

The customer game is available at `/play/login`.

## 2. Test environment

All mutable tests used an isolated PostgreSQL 14-compatible test container and databases containing `_test` in their names. A loopback-only TCP forward exposed the disposable database to the test processes.

Production Railway data and production URLs were not modified or used by the tests.

Test credentials, usernames, mobile numbers, JWT secrets, idempotency keys, ports, and database schemas were generated at runtime. No reusable test credential was committed.

### Test tools

- Node.js built-in `node:test`
- Real PostgreSQL and Prisma migrations
- Black-box HTTP requests against a spawned compiled Express server
- Multiple independent Prisma connections for concurrency tests
- Playwright Chromium for browser testing
- TypeScript compiler and Vite production build
- Prisma schema validation
- `npm audit`

## 3. Test run history

### Test Run 1 — Baseline before customer-game implementation

Baseline commit: backend `0526285`.

| Test | Expected | Actual | Result |
|---|---:|---:|---|
| Admin login | 200 | 200 | PASS |
| Admin creates a customer record | 201 | 201 | PASS |
| Customer logs into game | 200 | 404 | FAIL — endpoint did not exist |
| Customer places a bet | 201 | 404 | FAIL — endpoint did not exist |
| Viewer tries to mutate a market | 403 | 403 | PASS |
| Concurrent declaration test in this run | One payout | One payout | PASS in this execution; broader race coverage was still absent |

Baseline conclusion: the repository was an admin panel only. Customer authentication, customer-owned APIs, bid placement, deposit creation, withdrawal creation, and customer UI did not exist.

### Test Run 2 — Initial customer API integration

The initial new customer integration suite passed against fresh PostgreSQL.

Covered:

- Admin and viewer authentication
- Customer A and Customer B creation
- Username/password login
- Mobile/MPIN login
- Staff/customer JWT domain separation
- Viewer write denial
- Wallet funding
- Bid debit
- Bid idempotency
- Insufficient funds
- Customer A/B bid isolation
- Winning payout
- Losing bid
- Result redeclaration idempotency
- Conflicting settled-result rejection
- Deposit creation/approval
- Withdrawal reservation/rejection/approval
- Customer A/B request isolation

Result: **PASS**.

### Test Run 3 — First concurrency and admin regression execution

Two defects were reproduced.

1. PostgreSQL serialization failures surfaced through Prisma as `P2010` with SQLSTATE `40001`. The transaction helper only retried `P2034`, so concurrent wallet requests could terminate the server.
2. `GET /api/wallet?page=0` calculated a negative Prisma offset and terminated the server instead of returning HTTP 400.

Result: **FAIL**.

Fixes:

- Added retry handling for `P2010`/`40001`, bounded retry backoff, and additional retry attempts.
- Reworked wallet pagination and ID validation using shared bounded parsers.
- Added async Express error forwarding and consistent JSON 404/500 responses.

### Test Run 4 — Concurrency and admin rerun

Two further defects were identified.

1. A losing bid was stored as `won` with `winningAmount=0.00`. Prisma Decimal's `isPositive()` did not express the intended strict `> 0` rule.
2. A schedule could be updated through a different market's URL because the route ignored the parent market ID.

Result: **FAIL**.

Fixes:

- Changed settlement classification to `winningAmount.greaterThan(0)`.
- Changed schedule update to require both `scheduleId` and matching `marketId`.

### Test Run 5 — Concurrency fixture rerun

The application reached withdrawal concurrency testing. A randomly generated base64url idempotency key could begin with `_` or `-`, while the API correctly requires an alphanumeric first character.

Result: **FAIL — test fixture defect**.

Fix:

- Prefixed generated test idempotency keys with `key_`.
- Production browser submissions use UUID values and were not affected.

### Test Run 6 — Corrected concurrency and admin suites

| Suite | Result |
|---|---|
| Concurrent wallet and exactly-once effects | PASS |
| Administrative API regression | PASS |
| Customer game integration | PASS |
| Win-calculation unit tables | PASS |

### Browser Run 1

Playwright could not launch because Chromium had not been installed.

Result: **BLOCKED — test environment**.

Fix: installed the Playwright-matched Chromium and headless-shell binaries.

### Browser Run 2

Dashboard login labels were visible but not associated with their inputs.

Result: **FAIL**.

Fix: added input IDs and matching `htmlFor` label associations to dashboard, customer login, bid, and customer-creation forms.

### Browser Run 3

The browser reached the customer market, but a bid near midnight used the UTC date while the backend correctly used the India business date. The bid was rejected as a past-date market request.

Result: **FAIL**.

Fix: frontend bid dates now use `Asia/Kolkata` consistently.

### Browser Runs 4 and 5

Application workflows passed up to the relevant points. Failures were test-locator issues:

- `Logout` versus the actual accessible name `Log out`
- `Name` matching both Name and Username
- A broad content locator matching nested elements

Result: **FAIL — test fixture selectors**.

Fixes: corrected locators without weakening application assertions.

### Browser Run 6

Complete UI flow passed:

- Admin login
- Customer creation through the actual modal
- Customer funding
- Game login
- Active market display
- Bid placement and wallet debit
- Partial opening-result declaration
- Winner payout and result display
- Deposit request form
- Withdrawal request and reserved balance
- Customer logout
- Viewer login and read-only controls

Result: **PASS**.

### Browser route-smoke run

The browser visited every registered admin route while preserving the authenticated context. Every route rendered non-empty content and no uncaught page error was recorded. Personal-game subroutes now use wildcard routing instead of producing blank dashboard content.

Result: **PASS**.

### Migration upgrade runs

The upgrade test builds the schema represented by the first two migrations, inserts populated historical data, then applies the customer-game migration.

Initial test-fixture failures:

1. The fixture inserted into `mpin` after the prior migration had already renamed it to `mpinHash`.
2. `psql` command-status output preceded the selected data line.

Both fixture defects were corrected.

Final assertions:

- Existing customer count preserved.
- Historical negative balance preserved rather than blocking deployment.
- Existing customer remains unenrolled for username/password until updated.
- The real legacy-MPIN hashing path succeeds even when the historical wallet is negative.
- New columns and indexes are created.

Result: **PASS**.

## 4. Final automated test results

Final command:

```text
TEST_DATABASE_URL=<loopback _test PostgreSQL URL> npm test
```

The command builds current TypeScript before running tests and gives every integration file a unique PostgreSQL schema.

| Suite | Tests/scenario | Result |
|---|---|---|
| Customer game API | Full A/B identity, auth, bid, result, deposit, withdrawal and ban lifecycle | PASS |
| Concurrency wallet | Ten-way races and exactly-once effects | PASS |
| Administrative API | Auth, dashboard accounts, customers, markets, schedules, rates, notifications, settings, contents, timings, reports, malformed inputs and unknown routes | PASS |
| Migration upgrade | Populated prior schema and staged legacy constraints | PASS |
| Win calculation | 7 table-driven test groups covering all supported game types | 7/7 PASS |
| Backend build | Prisma generation and TypeScript | PASS |
| Prisma validation | Current schema | PASS |
| Frontend build | TypeScript and Vite production bundle | PASS |
| Browser E2E | Admin/customer/viewer workflow and all registered admin routes | PASS |
| Diff whitespace check | Backend and frontend source | PASS |

## 5. Functionality verified

### Authentication and identity

- Admin login works.
- Viewer login works.
- Viewer cannot perform POST, PUT, PATCH, or DELETE administrative actions.
- Customer login works with username/password.
- The same customer works with mobile/MPIN.
- Dashboard tokens are rejected by customer middleware.
- Customer tokens are rejected by dashboard middleware.
- Banning a customer immediately invalidates the existing customer token.
- Unbanning permits a fresh login.
- Credential hashes are not returned by API responses.

### Customer isolation

- Customer A sees only Customer A bids.
- Customer B sees zero Customer A bids.
- Customer A sees only Customer A wallet transactions.
- Customer B sees zero Customer A deposits and withdrawals.
- Customer routes reject query/body `userId` attempts.
- Customer tokens cannot call global users, wallet, bids, reports, approval, result-declaration, or dashboard-account endpoints.
- No tested request allowed one customer to debit, reserve, withdraw, or credit another customer's wallet.

### Markets and betting

- Only active markets and active schedules are returned to customers.
- A market with no active schedule rejects bids.
- Past business dates reject bids.
- Future bids are limited to seven India business days.
- Today's bid session observes India-time opening/closing cutoffs.
- Combined jodi, half-sangam, and full-sangam games require close-session semantics.
- Combined games cannot be placed after the opening result is known.
- Result-declared sessions reject further bids.
- Invalid IDs, dates, sessions, game types, numbers, amounts, and keys are rejected.
- Insufficient balance creates no bid and no debit.
- A repeated idempotency key with identical data returns the same bid without another debit.
- The same key with different data returns conflict.
- Payout multiplier is snapshotted when the bid is accepted.

### Wallet and concurrency

- Bid debit and bid creation commit atomically.
- Ten simultaneous credits accumulate without lost updates.
- Simultaneous full-balance bets cannot overdraw the wallet.
- Concurrent duplicate bid submissions create one bid/debit.
- Concurrent result declarations create one winner credit.
- Concurrent deposit approvals credit once.
- Concurrent bid reversions refund once.
- Only pending bids can be reverted.
- Settled bids cannot receive an extra refund.
- Concurrent withdrawal reservations cannot exceed available funds.
- Approval/rejection transitions occur once.
- Rejected reserved withdrawals release funds exactly once.
- Approved reservations reduce reserved balance without a second debit.
- Available balance plus reserved funds is checked against the wallet limit.

### Results and winnings

- Opening result can be declared separately.
- Eligible open-session bids settle at opening declaration.
- Closing result can be added later.
- Remaining close and combined games settle when enough result data exists.
- Identical declaration is idempotent.
- A conflicting result is rejected after financial settlement.
- Winning bid receives `stake × snapshotted multiplier`.
- Losing bid is marked `lost`, not `won` with zero payout.
- Customer results display opening pana/digit, jodi, and closing digit/pana.

### Game calculations

Verified winning and losing cases for:

- Single
- Jodi
- Single pana
- Double pana
- Triple pana
- SP
- DP
- TP
- FP
- CP
- Half sangam in both directions
- Full sangam

The previous `123` double-pana classification bug is covered by regression tests. Decimal-cent stakes and snapshotted multipliers are also covered.

### Deposits and withdrawals

- Customer creates and lists only their deposit requests.
- Deposit approval is exactly once.
- Customer creates and lists only their withdrawal requests.
- Withdrawal is reserved immediately, preventing overcommit.
- Rejection releases the reservation.
- Approval consumes the reservation without double-debiting.
- Frontend preserves idempotency keys after an ambiguous failure and rotates them only after success.

### Admin functionality

Verified API behavior for:

- Account list/create/reset/delete
- Customer create/list/search/get/update/ban/unban/delete
- Customer duplicate and validation errors
- Market create/read/update/delete
- Schedule create/update and parent-market ownership
- Game-rate read/update/validation
- Notification CRUD
- Settings read/update
- Content read/update
- Timing read/update
- Dashboard and report responses
- Wallet, bid, result, deposit, and withdrawal pagination/input errors
- JSON 404 responses

## 6. Defects fixed

1. Missing customer login and customer API.
2. Missing customer game frontend.
3. Missing bid creation and wallet deduction.
4. Missing customer deposit/withdrawal request creation.
5. Cross-customer ownership model absent.
6. Lost-update wallet operations.
7. Deposit/withdraw approval races.
8. Bid-revert double-refund race.
9. Settled bids could previously be reverted.
10. Result settlement could partially update bid and wallet.
11. Concurrent result declaration payout risk.
12. Losing bids classified as won with zero payout.
13. Double-pana precedence bug.
14. Mutable settlement-time rate problem; multiplier is now snapshotted.
15. Invalid/unbounded wallet pagination crash.
16. Async Express errors could terminate the server.
17. Schedule update ignored parent market.
18. Customer/frontend session and game-type casing mismatch.
19. Deposit/withdraw frontend omitted idempotency keys.
20. UTC/India business-date mismatch.
21. Admin result UI and backend disagreed on partial results.
22. Combined games could be placed after opening result.
23. Unlimited future betting.
24. Frontend wallet field-name mismatch.
25. Reserved funds were invisible in customer UI.
26. Customer creation form lacked accessible label associations.
27. User Details requested page sizes rejected by the API.
28. Fake password and fake history data were removed from User Details.
29. Broken personal-game subroutes rendered blank content.
30. Production migration could fail on historical invalid values.
31. Test command could run stale compiled JavaScript.

## 7. Database and Railway behavior

The migration `20260908000000_customer_game_api` adds:

- Customer username/password and login-state columns
- Reserved wallet balance
- Bid multiplier snapshots and idempotency keys
- Deposit/withdrawal idempotency keys
- Withdrawal reservation state
- Unique indexes
- Reserved-fund and positive-amount database constraints; application-level locked transactions prevent negative available wallets

The migration is backward-compatible with existing users:

- Existing MPIN login continues to use the same `User` row.
- Existing users have nullable username/password until an administrator updates/enrols them.
- Existing admin and viewer accounts are unchanged.

Railway already runs:

```text
npm run build
npx prisma migrate deploy
node dist/index.js
```

No new Railway variable is required beyond the existing database and JWT variables. The backend should be deployed before or at the same time as the frontend because the frontend calls the new customer endpoints.

## 8. Known limitations and non-passing/non-final areas

These are not hidden as passes.

### Historical constraint validation

Positive-amount constraints are `NOT VALID` so unknown historical bad requests cannot stop Railway deployment while PostgreSQL still enforces them for new inserts and updates. The new reserved-funds column has a validated nonnegative constraint. Available-wallet nonnegativity is enforced by locked serializable application transactions because a historical database may already contain negative balances; those rows should be reconciled before adding a validated wallet constraint later.

Recommended production preflight queries:

```sql
SELECT id, "walletBalance" FROM "User" WHERE "walletBalance" < 0;
SELECT id, amount FROM "Bid" WHERE amount <= 0;
SELECT id, amount FROM "DepositRequest" WHERE amount <= 0;
SELECT id, amount FROM "WithdrawRequest" WHERE amount <= 0;
```

### Settled-result correction

A settled result cannot currently be corrected. The server returns HTTP 409 rather than risking an incorrect reversal or duplicate payout. A future correction feature requires versioned results and explicit payout reversal entries.

Status: **SAFE REJECTION, correction workflow not implemented**.

### Customer session on refresh

Customer and staff bearer tokens are held in browser memory. Refreshing the browser requires signing in again. This avoids persistent browser token storage but is less convenient.

Status: **FUNCTIONAL, limited persistence**.

### Betting horizon

The current server permits today through seven India business days, provided the target weekday has an active schedule. The exact business horizon should be confirmed with the operator.

Status: **IMPLEMENTED with a seven-day policy; business confirmation recommended**.

### Placeholder administrative pages

Several legacy menu pages remain informational placeholders rather than complete business modules, including the base Game Management, Bookie Corner, Report Management, Wallet Management, Settings, Notice Management, Main Starline, and Main Jackpot placeholder pages. They render without browser crashes, but placeholder rendering is not equivalent to implemented functionality.

Status: **NOT IMPLEMENTED as full business modules**.

### Complex legacy frontend filters

The browser verified route rendering and primary workflows, while the backend verified filter validation. Every legacy combination of market/session/date/sort controls was not mathematically validated through a browser. Static review found some legacy pages whose controls do not send every displayed filter.

Status: **PARTIALLY VERIFIED; not claimed as complete**.

### Upload persistence

Payment/slider uploads use the backend filesystem. Railway storage is ephemeral unless a persistent volume is mounted.

Status: **FUNCTIONAL per process; Railway volume required for persistence**.

### Dependency audit

Backend audit reported 6 known dependency-tree advisories, including issues under Express/qs and bcrypt's installation dependency tree. Frontend audit reported 5 advisories under Vite/esbuild and Express/qs. Some suggested fixes require breaking major upgrades. No `--force` dependency upgrade was applied during this functional change.

Status: **KNOWN DEPENDENCY UPGRADES REMAIN**.

## 9. Final conclusion

The newly implemented customer identity, customer-scoped APIs, betting, results, wallet, deposit, withdrawal, admin/viewer authorization, migration path, concurrency controls, and primary browser flows are functionally passing in isolated tests.

The most important invariant—one customer cannot read or move another customer's money—passed direct token-domain, list-isolation, supplied-user-ID, wallet, deposit, withdrawal, and concurrency tests.

The code is ready for review and deployment of the tested scope. The known limitations above should not be represented as completed features.
