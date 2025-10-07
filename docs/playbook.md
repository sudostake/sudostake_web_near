# SudoStake playbook

## TL;DR
- Two primary roles share the protocol: **vault owners** who borrow liquidity and **lenders** who provide it.
- Everyone starts by connecting a wallet, picking a network, and registering with the relevant tokens.
- Owners mint a vault, build collateral, open a request, and later repay; lenders review requests, fund them, monitor repayments, and keep the indexing loop healthy.
- Every screen in the app reflects this flow—follow the steps below and you’ll move through the product confidently.

## 1. Set up your environment (all users)
1. **Choose a network** — Use the header toggle to pick testnet or mainnet; all subsequent actions target that factory.
2. **Connect your wallet** — Follow the [sign-in flow](./features/authentication-signin-flow.md). Both roles use the same path.
3. **Register with tokens** — When you first handle a token (typically USDC), run the one-click registration for your wallet (and your vault once it exists). Details in [Token registration](./reference/token-registration.md).

## 2. Vault owner journey
1. **Mint a vault** — From the dashboard, open the create dialog and approve the `mint_vault` transaction. See [Mint a vault](./guides/create-vault.md).
2. **Build collateral** — Deposit NEAR and delegate stake so the contract can verify your collateral. Deposit/Delegate dialogs live on the vault page.
3. **Open a liquidity request** — Fill in token, amount, interest, collateral, and duration; we handle unit conversions. Follow [Open a liquidity request](./guides/opening-liquidity-request.md).
4. **Respond to offers** — Lenders may fund directly; you’ll see the accepted offer in the dashboard. (Counter-offers coming soon.)
5. **Operate the vault** — Monitor available balance, undelegate if needed, and trigger indexing when prompted.
6. **Repay on time** — Use [Repay a loan](./guides/repay-loan.md) before the deadline. Successful repayment returns your vault to **Idle** and releases your lender.

## 3. Lender journey
1. **Review open requests** — The [Discover page](./features/discover.md) lists collateral, APR, and duration. Click through to inspect the vault’s history.
2. **Fund the request** — Open the vault page and run through [Fund a liquidity request](./guides/fund-liquidity-request.md). We call `ft_transfer_call` with your chosen amount.
3. **Track your positions** — Visit the dashboard’s **Positions** tab or the [Lender positions](./features/lender-positions.md) page. Updates stream from Firestore or REST.
4. **Await repayment** — When the owner repays, the position closes automatically. If the term expires, watch for liquidation notices (UI upgrades in progress).

## 4. Shared operations
- **Indexing** — Both roles rely on fresh data. After any on-chain change, the UI may prompt you to retry indexing; refer to [Indexing and consistency](./operations/indexing.md).
- **Viewer roles** — The app tailors actions by role. If a button is hidden, check [Viewer roles](./reference/roles.md) to see why.
- **Balances & tokens** — Use [Tokens and balances](./features/tokens.md) to understand how metadata, storage, and helpers keep wallet and vault balances synchronized.

## 5. Troubleshooting checklist
- **Wallet issues:** Retry the action; no state changes until the wallet confirms success.
- **Missing vault or position:** Hit **Retry indexing** or refresh—Firestore may be catching up.
- **Unexpected permissions:** Confirm you’re on the right network and connected with the intended wallet. Roles differ per vault.
- **Need support:** Grab the transaction hash from the toast, paste it in the support channel, and link the doc page you followed.

With this playbook and the linked guides, vault owners and lenders can move through SudoStake end to end without guesswork.
