# Lender positions

## TL;DR
- This view shows every vault you’ve funded and keeps it current in real time.
- You can switch between realtime Firestore updates and a REST API depending on how you prefer to host the app.
- Positions are sorted with the newest accepted offer first so the most recent activity stays at the top.

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
- Refresh or trigger indexing if a repayment just landed and the status still reads **Active**—indexing clears the position automatically.
- Watching someone else’s account? Use the search input at the top to paste a lender account ID and preview their public positions.
