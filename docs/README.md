# SudoStake docs

This documentation covers only behavior that is currently implemented in this app.

## Start here
- Borrower path: [Create a vault](./guides/create-vault.md) -> [Open a liquidity request](./guides/opening-liquidity-request.md) -> [Repay a loan](./guides/repay-loan.md)
- Lender path: [Browse Discover](./features/discover.md) -> [Fund a request](./guides/fund-liquidity-request.md) -> [Track positions](./features/lender-positions.md)
- End-to-end overview: [Playbook](./playbook.md)

## Current app scope
- Liquidity requests use the default USDC token for the active network.
- Vault UI states are `idle`, `pending`, and `active`.
- Discover and vault details are readable without signing in.
- Any state-changing action requires a connected wallet and wallet confirmation.
- The app defaults to `testnet`; there is no in-app network switch UI.

## Core docs
- [Playbook](./playbook.md)
- [Connect your wallet](./features/authentication.md)
- [Vault actions](./features/vaults.md)
- [Discover marketplace](./features/discover.md)
- [Viewer roles](./reference/roles.md)

## Reference docs
- [Networks](./reference/networks.md)
- [Token registration (NEP-141)](./reference/token-registration.md)
- [Data model](./reference/data-model.md)
- [API routes](./reference/api.md)
- [Indexing and consistency](./operations/indexing.md)

## Support
If you report an issue, include the doc link and related transaction hash.
