# SudoStake docs home

## TL;DR
- These pages explain the product in everyday language first, with links to deeper technical detail when you need it.
- Start with the architecture overview if you want the big picture, then choose the path for vault owners or lenders.
- Every reference doc has a matching guide so you can see both the “why” and the “how”.

## Pick your path

### If you run (or want to run) a vault
1. Read the [architecture overview](./architecture.md) so you know how your vault talks to NEAR and Firestore.
2. Connect a wallet with the [sign-in flow](./features/authentication-signin-flow.md) and make sure you’re [registered with each token](./reference/token-registration.md).
3. [Mint a vault](./guides/create-vault.md) on the network you care about, then follow the [vault actions overview](./features/vaults.md).
4. Open your first request with [Open a liquidity request](./guides/opening-liquidity-request.md).
5. Keep [Repay a loan](./guides/repay-loan.md) and the [indexing playbook](./operations/indexing.md) handy for day-to-day operations.

### If you lend liquidity (or you’re considering it)
1. Skim the [architecture overview](./architecture.md) for context, then connect your wallet with the [sign-in flow](./features/authentication-signin-flow.md).
2. Make sure you’re [registered with the token](./reference/token-registration.md) you plan to lend.
3. Walk through [Fund a liquidity request](./guides/fund-liquidity-request.md) so you know exactly what happens when you lend.
4. Use [Discover open requests](./features/discover.md) to find opportunities and [Track lender positions](./features/lender-positions.md) to monitor the loans you’ve funded.
5. Review [Repay a loan](./guides/repay-loan.md) so you know what the owner sees when they return funds.

## How to use these docs
- **Learn the shape of the product:** Read the [architecture overview](./architecture.md) to see how wallets, Firestore, and the NEAR blockchain work together.
- **Get something done:** Open a guide such as [requesting liquidity](./guides/opening-liquidity-request.md) or [repaying a loan](./guides/repay-loan.md). Each guide calls out risks and the time it usually takes.
- **Look up a detail:** Use the reference section for API routes, data models, and network IDs when you are wiring automation or reviewing support tickets.
- **Stay in plain language:** If you hit jargon, check the [docs voice guide](./meta/style-guide.md) and suggest an edit—these pages are meant to stay friendly.

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

### Reference
- [API reference](./reference/api.md)
- [Data model](./reference/data-model.md)
- [Networks and RPC endpoints](./reference/networks.md)
- [Token registration (NEP-141)](./reference/token-registration.md)
- [Viewer roles](./reference/roles.md)

### For editors
- [Docs voice and tone guide](./meta/style-guide.md)
- [Plain-language rewrite backlog](./meta/rewrite-backlog.md)
- [Rendering upgrade plan](./meta/rendering-upgrade.md)

### Operations
- [Indexing and consistency](./operations/indexing.md)

## Need help?
Reach out in the support Slack channel or file a GitHub issue with the page link. We’ll keep iterating until every lender and requester can follow these docs without a dictionary.
