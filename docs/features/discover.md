# Discover marketplace

## TL;DR
- Discover lists open borrower requests (`state = pending`).
- You can filter by token and search by vault/token text.
- Opening a card takes you to the vault page for funding decisions.

## Card fields
Discover cards use these labels:
- `Amount`
- `Interest`
- `Repay`
- `Term`
- `Collateral`
- `Est. APR`

## How lenders use it
1. Open `/discover`.
2. Filter or search.
3. Open a vault request.
4. Accept request from the vault page if terms fit.

## Data behavior
- Default: realtime Firestore subscription.
- Optional: REST polling with `NEXT_PUBLIC_PENDING_USE_API=true`.
- Errors auto-retry in the list view.

## Related
- [Fund a liquidity request](../guides/fund-liquidity-request.md)
- [Lender positions](./lender-positions.md)
