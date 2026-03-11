# SudoStake playbook

## TL;DR
- SudoStake has two roles: borrowers (vault owners) and lenders.
- Borrowers open collateralized requests, and lenders fund them from Discover.
- After funding, the owner repays or both sides move through the expiry and claims flow.

## Product flow in one view

| Stage | Borrower | Lender | Where it happens |
| --- | --- | --- | --- |
| 1. Enter | Connect wallet | Browse Discover or connect wallet | Landing page, nav |
| 2. Prepare | Create a vault and add collateral | Review request terms | Dashboard, vault page, Discover |
| 3. Open or fund | Open a request | Accept a request | Vault page |
| 4. Active loan | Watch the timer and repay | Track funded position | Vault page, dashboard |
| 5. Resolve | Repay or handle expiry | Process claimable collateral | Vault page |

## Borrower flow
1. Connect your wallet from the landing page or navigation.
2. Open `/dashboard` and create a vault.
3. Add or delegate NEAR so the vault has enough collateral.
4. Open a request from the vault page.
5. If the request is still pending, you can cancel it.
6. After funding, watch the timer on the vault page.
7. Repay before liquidation starts.
8. If the loan expires, use the vault page to handle claims.

Guides:
- [Create a vault](./guides/create-vault.md)
- [Open a request](./guides/opening-liquidity-request.md)
- [Repay a loan](./guides/repay-loan.md)

## Lender flow
1. Open `/discover` and filter or search open requests.
2. Open a vault page to review the terms.
3. Register storage if the app prompts you.
4. Accept the request in your wallet with `ft_transfer_call`.
5. Track funded vaults in Dashboard -> Positions.
6. After expiry, process claims from the vault page when they become available.

Guides:
- [Discover requests](./features/discover.md)
- [Fund a request](./guides/fund-liquidity-request.md)
- [Lender positions](./features/lender-positions.md)

## Important behavior
- Request creation is currently USDC-only in the request dialog.
- UI actions are role-based (`owner`, `activeLender`, `potentialLender`, `guest`).
- State-changing actions always require wallet confirmation.
- If indexing fails after a transaction, the app shows a blocking retry modal.

## If something looks wrong
- Confirm the connected account in the nav menu.
- Confirm the active network label in the header.
- Refresh or retry indexing after recent transactions.
- Use the transaction hash from wallet or toast when escalating.
