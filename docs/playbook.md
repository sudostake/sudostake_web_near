# SudoStake playbook

## TL;DR
- SudoStake has two roles: borrowers (vault owners) and lenders.
- Borrowers open collateralized requests; lenders fund requests from Discover.
- After funding, the owner repays or either side processes claims after expiry.

## Product flow in one view

| Stage | Borrower action | Lender action | Where in app |
| --- | --- | --- | --- |
| 1. Enter | Connect wallet | Browse Discover or connect wallet | Landing, navigation |
| 2. Prepare | Create vault, deposit/delegate NEAR | Review request terms | Dashboard, vault page, Discover |
| 3. Open/Fund | Open request | Accept request | Vault page |
| 4. Active loan | Monitor timer and balances | Track position and expiry | Vault page, Positions tab |
| 5. Close | Repay loan or process claims | Receive repayment or process claims | Vault page |

## Borrower flow
1. Connect wallet from the landing page or navigation.
2. Open `/dashboard` and create a vault.
3. Add NEAR and delegate if needed for collateral capacity.
4. Open a request from the vault page.
5. While pending, you can cancel the request.
6. After funding, monitor the loan timer.
7. Repay from the vault page before liquidation starts, or process claims after expiry.

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
6. If a loan expires, process claims from the vault page when available.

Guides:
- [Discover requests](./features/discover.md)
- [Fund a request](./guides/fund-liquidity-request.md)
- [Lender positions](./features/lender-positions.md)

## Important behavior to know
- Request creation is currently USDC-only in the request dialog.
- UI actions are role-based (`owner`, `activeLender`, `potentialLender`, `guest`).
- State-changing actions always require wallet confirmation.
- Indexing may lag briefly after on-chain execution; retry indexing when prompted.

## If something looks wrong
- Confirm the connected account in the nav menu.
- Confirm the active network label in the header.
- Refresh or retry indexing after recent transactions.
- Use the transaction hash from wallet/toast when escalating.
