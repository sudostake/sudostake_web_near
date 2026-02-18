# Vault actions

## TL;DR
- The vault page is the main operating screen for borrowing and repayment.
- Actions shown depend on your role (`owner`, `activeLender`, `potentialLender`, `guest`) and vault state.
- Core states are `idle`, `pending`, and `active`.

## State flow
- `idle`: owner can open a new request.
- `pending`: request is open; owner can cancel; potential lender can accept.
- `active`: loan funded; owner can repay; lender can process claims after expiry when claimable.

## Owner controls
- Manage vault funds: deposit, withdraw, transfer ownership.
- Manage delegations: delegate, undelegate, claim unstaked (subject to state restrictions).
- Open request when idle.
- Cancel request while pending.
- Repay while active and before liquidation has started.
- Start liquidation/claim processing after expiry.

## Lender controls
- Accept request when pending and eligible.
- Process claims after expiry when available.

## Shared page sections
- Vault header (account, balances, state).
- Available balance and delegations.
- Liquidity request card and dialogs.
- Liquidation status section when liquidation exists.

## Indexing
After state-changing actions, the app re-indexes vault data. If indexing fails, the app shows a blocking `Retry indexing` modal.

## Related
- [Viewer roles](../reference/roles.md)
- [Open a liquidity request](../guides/opening-liquidity-request.md)
- [Repay a loan](../guides/repay-loan.md)
