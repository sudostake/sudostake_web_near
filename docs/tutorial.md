# Guided tutorial

## TL;DR
- Time: 10 to 15 minutes to understand the full app flow.
- Start on public screens first, then connect your wallet only when you need to act.
- At the midpoint, choose the borrower or lender branch that matches what you want to do.

## Before you start
- The app currently defaults to `testnet`.
- Liquidity requests use the default USDC token for the active network.
- You can browse Discover and vault pages without signing in.
- Any action that changes state requires wallet confirmation.
- If a transaction succeeds but the UI does not update, retry indexing and keep the transaction hash.

## Step 1. Start on the landing page
1. Open `/`.
2. Find the two public entry points: `Connect wallet` and `Discover`.
3. If live opportunity cards appear, open one to inspect a vault page in read-only mode.

What you should learn:
- The public app is safe to explore before connecting a wallet.
- Borrowers and lenders both start from the same top-level navigation.

Read more:
- [Landing page](./features/home.md)

## Step 2. Browse Discover before you connect
1. Open `/discover`.
2. Review the request list and try search or filters.
3. Open a request card to land on its vault page.

What you should learn:
- Discover is the public marketplace for open requests.
- Funding decisions happen on the vault page, not in the list itself.

Read more:
- [Discover marketplace](./features/discover.md)

## Step 3. Connect your wallet and enter dashboard
1. Use `Connect wallet` from the landing page, top navigation, or a vault prompt.
2. After the wallet connects, open `/dashboard`.
3. Review the three parts of the workspace: `Vaults`, `Positions`, and wallet balances.

What you should learn:
- `Dashboard` is the signed-in home for your account.
- `Vaults` is the borrower side of the workspace.
- `Positions` is the lender side of the workspace.

Read more:
- [Connect your wallet](./features/authentication.md)
- [Dashboard workspace](./features/dashboard.md)

## Step 4. Choose your branch

### Borrower branch
1. In `/dashboard`, click `New vault`.
2. Open the new vault after it appears in `Vaults`.
3. Add or delegate NEAR so the vault has enough collateral.
4. Use `Open request` to create a pending USDC request.
5. Return later to the same vault page to repay before liquidation starts.

Read more:
- [Create a vault](./guides/create-vault.md)
- [Vault page](./features/vaults.md)
- [Open a liquidity request](./guides/opening-liquidity-request.md)
- [Tokens and balances](./features/tokens.md)
- [Repay a loan](./guides/repay-loan.md)

### Lender branch
1. Start in `/discover`.
2. Open a request and review its terms on the vault page.
3. Complete storage registration if the app prompts you.
4. Click `Accept request` and approve the wallet transaction.
5. Return to `/dashboard` -> `Positions` to reopen funded vaults.

Read more:
- [Fund a liquidity request](./guides/fund-liquidity-request.md)
- [Lender positions](./features/lender-positions.md)
- [Viewer roles](./reference/roles.md)

## Step 5. Know the common blockers
- If the app asks for token registration, complete the `storage_deposit` step first.
- If a transaction finishes but the list or vault stays stale, use the indexing retry flow.
- If actions are missing, verify the connected account, active network, and current vault state.

Read more:
- [Token registration](./reference/token-registration.md)
- [Indexing and consistency](./operations/indexing.md)
- [Sign-in flow](./features/authentication-signin-flow.md)

## Step 6. Use reference only when you need it
- Open the playbook if you want the full borrower/lender lifecycle in one view.
- Open architecture or API docs only when you need implementation detail.

Reference:
- [Playbook](./playbook.md)
- [Architecture overview](./architecture.md)
- [Networks](./reference/networks.md)
- [Data model](./reference/data-model.md)
- [API routes](./reference/api.md)
