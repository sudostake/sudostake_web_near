# Lender positions

## TL;DR
- The Positions tab tracks every vault you’ve funded and updates in real time.
- You can choose between a realtime Firestore subscription or a REST polling mode depending on deployment constraints.
- Positions are sorted by most recent activity so the loans that need attention stay near the top.
- Not lending yet? Browse in read-only mode, then connect once you’re ready so the dashboard starts tracking your loans automatically.

## What appears on the page
- Vault name, funded amount, token, interest rate, and payoff date.
- Status badges: **Active**, **Waiting for repayment**, or **Closed** after funds are returned.
- Quick actions to open the vault details or view the original request.

## Data sources
1. The feature watches Firestore for documents where `accepted_offer.lender` matches the connected account.
2. With `NEXT_PUBLIC_LENDING_USE_API=false` (default) we subscribe live so changes show up within seconds.
3. With `NEXT_PUBLIC_LENDING_USE_API=true` we poll:
   ```
   GET /api/view_lender_positions?factory_id=<factoryId>&lender_id=<accountId>
   ```
   Use this when you want predictable fetch intervals or server-side rendering without Firebase on the client.

## Where the code lives
- `utils/data/lending.ts` — decides between realtime and REST modes.
- `app/api/view_lender_positions/route.ts` — REST handler with basic validation.
- `utils/db/vaults.ts` — Firestore query helpers shared across dashboards.

## Helpful habits
- Refresh or trigger indexing if a repayment just landed and the status still reads **Active**—indexing finalises the position automatically.
- Reviewing another team’s account? Use the search input to paste their lender ID and preview public positions.
- New lender? Keep [Fund a liquidity request](../guides/fund-liquidity-request.md) handy so you remember the repayment flow and claim logic.

