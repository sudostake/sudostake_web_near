# Vault page

## TL;DR
- The vault page is the main screen for one vault.
- Actions depend on your role (`owner`, `activeLender`, `potentialLender`, `guest`) and the vault state.
- Core states are `idle`, `pending`, and `active`.

## What each state means

| State | What it means | Owner can do | Lender can do |
| --- | --- | --- | --- |
| `idle` | No open request | Manage funds and delegations, open a request | View only |
| `pending` | Request is waiting for funding | Cancel the request | Accept the request if eligible |
| `active` | Loan has been funded | Repay before liquidation, handle expiry flow | Process claims after expiry when available |

Some fund and delegation actions are restricted while a request is pending or active.

## Main sections on the page
- Vault header with account, balances, and state.
- Available balance and delegation details.
- Liquidity request card and related dialogs.
- Liquidation section when liquidation data exists.

## What happens after an action
The app re-indexes vault data after state-changing actions. If indexing fails, the page shows a blocking `Retry indexing` modal.

## Related
- [Viewer roles](../reference/roles.md)
- [Open a liquidity request](../guides/opening-liquidity-request.md)
- [Repay a loan](../guides/repay-loan.md)
