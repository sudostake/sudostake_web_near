# SudoStake docs

## Start here
- New borrower: [Create your first vault](./guides/create-vault.md) -> [Open a liquidity request](./guides/opening-liquidity-request.md) -> [Repay a loan](./guides/repay-loan.md)
- New lender: [Browse Discover](./features/discover.md) -> [Fund a request](./guides/fund-liquidity-request.md) -> [Track your positions](./features/lender-positions.md)
- Need the full picture first: [Playbook](./playbook.md)

## Current app flow (as shipped)
- Borrowers connect a wallet, create a vault, and open a request backed by NEAR collateral.
- Lenders review open requests in Discover, open a vault page, and accept a request.
- Repayment and claim processing are handled on the vault page after a request is active.
- Indexing keeps Firestore in sync with on-chain state; use Retry indexing when prompted.

## Scope notes
- The request form is currently fixed to the default USDC token for the active network.
- Vault states in the UI are `idle`, `pending`, and `active`.
- Discover is readable without signing in; transactions require a connected wallet.

## Core docs
- Product flow: [Playbook](./playbook.md)
- Wallet connection: [Connect your wallet](./features/authentication.md)
- Vault operations: [Vault actions](./features/vaults.md)
- Marketplace: [Discover](./features/discover.md)
- Roles and permissions: [Viewer roles](./reference/roles.md)

## References
- [Networks](./reference/networks.md)
- [Token registration (NEP-141)](./reference/token-registration.md)
- [Data model](./reference/data-model.md)
- [API routes](./reference/api.md)
- [Indexing and consistency](./operations/indexing.md)

## Support
If a flow is unclear, include the page link and related transaction hash when reporting in Telegram or GitHub.
