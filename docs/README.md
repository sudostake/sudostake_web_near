# SudoStake docs home

## TL;DR
- These pages show you how to get something done right away—just pick whether you’re managing a vault or lending tokens.
- Every guide is written in everyday language, with callouts for risks, timing, and what to do next.
- You can always jump between the owner and lender paths; many teams play both roles.

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
Reach out in the support Slack channel or file a GitHub issue with the page link. We’ll keep iterating until every lender and requester can follow these docs without a dictionary.
