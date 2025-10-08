# SudoStake docs home

## What you’ll find here
- Operator-focused guides that mirror the product: connect a wallet, prepare a vault, publish a request, fund it, and repay.
- Checklists and callouts written in clear language so teams can move quickly without cross-referencing multiple tabs.
- References for developers and analysts who need to understand contract architecture, indexing, and data models.

You can jump between roles at any time. Many organisations both borrow and lend, so every section aims to keep the full loop visible.

## Pick your starting point

### If you operate a vault
1. Start with the [architecture overview](./architecture.md) to understand how the vault contract, Firestore, and the app communicate.
2. Connect your wallet via the [sign-in flow](./features/authentication-signin-flow.md) and [register each token](./reference/token-registration.md) you plan to move.
3. Follow [Mint a vault](./guides/create-vault.md) to spin up your contract, then review [Vault actions](./features/vaults.md) to learn every control on the dashboard.
4. Launch your first borrower offer with [Open a liquidity request](./guides/opening-liquidity-request.md) and keep [Repay a loan](./guides/repay-loan.md) close for closing the loop.
5. Keep operations healthy with the [Indexing playbook](./operations/indexing.md) so data stays fresh for lenders.

### If you provide liquidity
1. Skim the [architecture overview](./architecture.md) so you know what the vault contract guarantees.
2. Confirm your wallet is registered with the lending token using [Token registration](./reference/token-registration.md).
3. Use [Discover open requests](./features/discover.md) to evaluate opportunities and [Fund a liquidity request](./guides/fund-liquidity-request.md) for the full funding flow.
4. Keep [Lender positions](./features/lender-positions.md) handy to monitor repayments, liquidation progress, and yields.
5. Review [Repay a loan](./guides/repay-loan.md) to understand what the borrower sees when principal and interest come back.

## Quick map

### Product overview
- [SudoStake playbook](./playbook.md)
- [Architecture overview](./architecture.md)

### Core features
- [Connect a wallet](./features/authentication.md)
- [Sign-in flow](./features/authentication-signin-flow.md)
- [Discover open liquidity requests](./features/discover.md)
- [Track lender positions](./features/lender-positions.md)
- [Understand vault actions](./features/vaults.md)
- [Tokens and balances](./features/tokens.md)

### Step-by-step guides
- [Mint a vault](./guides/create-vault.md)
- [Open a liquidity request](./guides/opening-liquidity-request.md)
- [Fund a liquidity request](./guides/fund-liquidity-request.md)
- [Repay an active loan](./guides/repay-loan.md)

### Helpful references
- [What the app stores](./reference/data-model.md)
- [Network quick facts](./reference/networks.md)
- [Token registration (NEP-141)](./reference/token-registration.md)
- [Who can do what](./reference/roles.md)

### Operations
- [Indexing and consistency](./operations/indexing.md)

## Need help?
Reach out in the Telegram channel or open an issue on GitHub with the page link and any transaction hashes. We update these docs quickly when something is unclear.

