# SudoStake playbook

## TL;DR
- SudoStake has two roles: borrowers (vault owners) and lenders.
- Borrowers open collateralized requests; lenders fund requests from Discover.
- After funding, the owner repays, or claims are processed after expiry.

## Product flow in one view

| Stage | Borrower action | Lender action | Where in app |
| --- | --- | --- | --- |
| 1. Enter | Connect wallet | Browse Discover or connect wallet | Landing, navigation |
| 2. Prepare | Create vault, manage NEAR collateral | Review request terms | Dashboard, vault page, Discover |
| 3. Open/Fund | Open request | Accept request | Vault page |
| 4. Active loan | Monitor countdown and repay status | Track funded position | Vault page, dashboard positions |
| 5. Resolve | Repay loan or start liquidation/claims after expiry | Process claimable collateral after expiry | Vault page |

## Borrower flow
1. Connect wallet from the landing page or navigation.
2. Open `/dashboard` and create a vault.
3. Add NEAR and delegate if needed for collateral capacity.
4. Open a request from the vault page.
5. While pending, you can cancel the request.
6. After funding, monitor the loan timer on the vault page.
7. Repay while liquidation has not started.
8. If expired, start claim processing from the vault page.

Guides:
- [Create a vault](./guides/create-vault.md)
- [Open a request](./guides/opening-liquidity-request.md)
- [Repay a loan](./guides/repay-loan.md)

## Lender flow
1. Open `/discover` and filter/search open requests.
2. Open a vault detail page to review terms.
3. Register storage if prompted.
4. Accept the request (wallet signs an `ft_transfer_call`).
5. Track funded vaults in Dashboard -> Positions.
6. After expiry, process claims from the vault page when claimable.

Guides:
- [Discover requests](./features/discover.md)
- [Fund a request](./guides/fund-liquidity-request.md)
- [Lender positions](./features/lender-positions.md)

## Important behavior to know
- Request creation is currently USDC-only in the request dialog.
- UI actions are role-based (`owner`, `activeLender`, `potentialLender`, `guest`).
- State-changing actions always require wallet confirmation.
- If indexing fails after a transaction, the app shows a blocking retry modal.

## If something looks wrong
- Confirm the connected account in the nav menu.
- Confirm the active network label in the header.
- Refresh or retry indexing after recent transactions.
- Use the transaction hash from wallet/toast when escalating.
