# Discover marketplace

## TL;DR
- Discover shows open borrower requests (`state = pending`).
- You can search and filter before opening a vault.
- Funding still happens on the vault page.

## What you can do here
1. Open `/discover`.
2. Filter by token or search by vault and token text.
3. Open a card to review the request on the vault page.
4. Decide whether to fund from there.

## What each card field means
- `Amount`: how much the borrower wants.
- `Interest`: how much extra the borrower will repay.
- `Repay`: total repayment amount.
- `Term`: loan length after funding.
- `Collateral`: NEAR locked against the request.
- `Est. APR`: estimated annualized return from the listed terms.

## How the list updates
- Default: realtime Firestore subscription.
- Optional: REST polling with `NEXT_PUBLIC_PENDING_USE_API=true`.
- Errors auto-retry in the list view.

## If results look wrong
- Wait a moment after a recent transaction; indexing may still be running.
- Refresh the page if a request should already be visible.
- Check the active network before assuming a request is missing.

## Related
- [Fund a liquidity request](../guides/fund-liquidity-request.md)
- [Lender positions](./lender-positions.md)
