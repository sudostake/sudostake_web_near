# Open a liquidity request

## TL;DR
- Time: 3 to 5 minutes.
- Requirement: owner wallet connected, vault created, enough staked NEAR for collateral.
- Result: request moves to `pending` and appears in Discover.

## Before you start
- Requests use the default USDC token for the active network.
- You choose the amount, interest, collateral, and duration.
- The app checks storage registration before submission.
- The duration becomes the loan term after a lender accepts the request.

## Do this
1. Open your vault page.
2. Click `Open request` in the liquidity section.
3. If prompted, register the vault with the token.
4. Enter the amount, interest, collateral in NEAR, and duration in days.
5. Click `Continue`.
6. Approve `request_liquidity` in your wallet.
7. Wait for indexing to finish.

## Check it worked
- The vault state changes to `pending`.
- The request appears in Discover with `Amount`, `Interest`, `Repay`, `Term`, `Collateral`, and `Est. APR`.
- As the owner, you can still cancel the request while it is pending.

## If it fails
- Collateral too high: lower the collateral amount or add more staked NEAR.
- Storage not registered: complete the registration prompt and retry.
- Request not visible yet: wait for indexing, then refresh or retry.

## Next
- [Fund a liquidity request (lender flow)](./fund-liquidity-request.md)
- [Repay a loan](./repay-loan.md)
