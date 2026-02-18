# Token registration (NEP-141)

## TL;DR
- Token contracts require storage registration before they can store balances for an account.
- In this app, both wallet and vault may need registration depending on the flow.
- The UI checks this and surfaces one-click registration actions.

## Why it matters
Without registration, token transfers to or from that account can fail.

## Where it appears in the app
- Opening a request: vault registration check for the request token.
- Funding a request: lender wallet and vault registration checks.
- Repay top-up flow: owner wallet and vault registration checks.
- Registration actions call `storage_deposit` with `registration_only: true`.

## Manual flow (reference)
1. Read `storage_balance_bounds` on the token.
2. Call `storage_deposit` with the target account ID.
3. Attach at least the minimum required deposit.
4. Retry the original action.

## Tip
Use explorer links from dialogs/cards to confirm token account IDs and registration targets.
