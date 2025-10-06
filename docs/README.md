SudoStake Docs

This folder explains how the app works, in plain language. Start here when you need to understand a feature or how data flows through the app.

What’s inside

- Architecture
  - architecture.md – How the app is put together and where data comes from
- Features
  - features/authentication.md – Connect wallet and session basics
  - features/authentication-signin-flow.md – Sign-in flow and common cases
  - features/discover.md – See pending liquidity requests
  - features/lender-positions.md – See a lender’s funded vaults
  - features/vaults.md – Vault lifecycle (create, request, accept, repay, stake, ownership)
  - features/tokens.md – Tokens, balances, and metadata
- Guides
  - guides/opening-liquidity-request.md – Open your first liquidity request
  - guides/repay-loan.md – Repay a loan
- Reference
  - reference/api.md – All API routes and parameters
  - reference/data-model.md – Firestore document shapes and related types
  - reference/networks.md – Networks, factory contracts, and the RPC proxy
  - reference/token-registration.md – Token registration (why and how)
  - reference/roles.md – Viewer roles and UI rules
- Operations
  - operations/indexing.md – How indexing works and how to retry

Tip for new devs: read architecture.md first, then jump to the feature you’re working on. For local dev setup, see the root README.
