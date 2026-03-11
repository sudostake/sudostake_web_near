# SudoStake docs

Start with one walkthrough, then open the supporting pages only when you need extra detail.

## Start here
- [Guided tutorial](./tutorial.md)

## Borrower branch
- [Dashboard workspace](./features/dashboard.md)
- [Create a vault](./guides/create-vault.md)
- [Vault page](./features/vaults.md)
- [Open a liquidity request](./guides/opening-liquidity-request.md)
- [Tokens and balances](./features/tokens.md)
- [Repay a loan](./guides/repay-loan.md)

## Lender branch
- [Discover marketplace](./features/discover.md)
- [Fund a liquidity request](./guides/fund-liquidity-request.md)
- [Lender positions](./features/lender-positions.md)
- [Viewer roles](./reference/roles.md)

## Setup and recovery
- [Landing page](./features/home.md)
- [Connect your wallet](./features/authentication.md)
- [Token registration](./reference/token-registration.md)
- [Indexing and consistency](./operations/indexing.md)
- [Sign-in flow](./features/authentication-signin-flow.md)

## Deep reference
- [Playbook](./playbook.md)
- [Architecture overview](./architecture.md)
- [Networks](./reference/networks.md)
- [Data model](./reference/data-model.md)
- [API routes](./reference/api.md)

## What the app supports today
- Liquidity requests use the default USDC token for the active network.
- Vaults move through three main states: `idle`, `pending`, and `active`.
- Discover and vault detail pages are readable without signing in.
- Any state-changing action requires a connected wallet and wallet approval.
- The default network is `testnet`, and there is no in-app network switcher.

## Need help?
When you report an issue, include the doc link and the related transaction hash.
