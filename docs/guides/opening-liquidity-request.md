# Open a liquidity request

## TL;DR
- Time: 3 to 5 minutes.
- Requirement: owner wallet connected, vault created, enough staked NEAR for collateral.
- Result: request moves to `pending` and appears in Discover.

## What this dialog does today
- Token is fixed to the default USDC for the active network.
- You set: amount, interest, collateral, and duration.
- The app validates token storage registration for the vault before submission.

## Steps
1. Open your vault page.
2. In the liquidity section, click `Open request`.
3. If prompted, register the vault with the token.
4. Fill in request values:
   - Amount
   - Interest
   - Collateral (NEAR)
   - Duration (days)
5. Click `Continue` and approve `request_liquidity` in wallet.
6. Wait for indexing.

## After submission
- Vault state becomes `pending`.
- Discover shows the request fields (`Amount`, `Interest`, `Repay`, `Term`, `Collateral`, `Est. APR`).
- As owner, you can cancel while still pending.

## Common issues
- Collateral too high: reduce collateral or increase staked NEAR.
- Storage not registered: run registration prompt and retry.
- Request not visible yet: wait for indexing or retry.

## Next
- [Fund a liquidity request (lender flow)](./fund-liquidity-request.md)
- [Repay a loan](./repay-loan.md)
