# SudoStake playbook

## TL;DR
- SudoStake has two operators: **vault owners** who borrow against staked NEAR and **lenders** who supply USDC liquidity.
- Both roles begin the same way—connect a wallet, choose a network, and register the tokens you intend to move.
- Owners mint a vault, build collateral, publish a request, and repay on schedule; lenders review requests, fund them, and monitor repayments or liquidations.
- The app mirrors this loop. Follow the checklists below to move through SudoStake without surprises.

## 1. Prepare your environment (everyone)
1. **Choose a network** — Use the header toggle to pick testnet or mainnet. Every subsequent action, including minting a vault, targets that factory.
2. **Connect your wallet** — Follow the [sign-in flow](./features/authentication-signin-flow.md). Owners and lenders share the same flow, so switching roles is seamless.
3. **Register tokens once** — When you first interact with USDC (or another NEP‑141 token), register storage for both your wallet and, later, your vault. Refer to [Token registration](./reference/token-registration.md) for the exact prompts.

## 2. Vault owner journey
1. **Mint a vault** — From the dashboard, open the create dialog and approve the `mint_vault` transaction. Follow [Mint a vault](./guides/create-vault.md) for the exact prompts.
2. **Build collateral** — Deposit NEAR and delegate stake so the contract can prove your health buffer. Deposit and delegate dialogs live on the vault page.
3. **Publish a liquidity request** — Choose token, amount, target buffer, interest, and duration. The UI handles unit conversions. See [Open a liquidity request](./guides/opening-liquidity-request.md).
4. **Monitor lender commitments** — Lenders fund directly; accepted offers appear in the dashboard and on the vault page.
5. **Run daily operations** — Watch available balance, undelegate if you need to free collateral, and trigger indexing when prompted so data stays fresh.
6. **Repay before expiry** — Use [Repay a loan](./guides/repay-loan.md) before the deadline. Once principal and interest clear, the vault returns to **Idle** and your lender is released.

## 3. Lender journey
1. **Review active requests** — The [Discover page](./features/discover.md) lists collateral ratios, annualised interest, and duration. Drill into the vault for history and health.
2. **Fund from the vault view** — Follow [Fund a liquidity request](./guides/fund-liquidity-request.md). Behind the scenes we use `ft_transfer_call` with your chosen amount and attach the expected metadata.
3. **Track funded positions** — Use the dashboard’s **Positions** tab or [Lender positions](./features/lender-positions.md) to monitor repayments and liquidation progress in real time.
4. **Stay responsive after expiry** — Repayments close positions automatically. If a term expires, watch liquidation updates and be ready to process claims.

## 4. Shared operations
- **Indexing** — Fresh data keeps both sides aligned. After on-chain changes, the UI may ask you to re-run indexing. Follow [Indexing and consistency](./operations/indexing.md) for troubleshooting.
- **Viewer roles** — Buttons shift based on whether you’re the owner, active lender, or observer. See [Viewer roles](./reference/roles.md) if something looks unavailable.
- **Balances & tokens** — [Tokens and balances](./features/tokens.md) explains metadata, storage deposits, and helper utilities that keep wallet and vault balances in sync.

## 5. Troubleshooting checklist
- **Wallet rejected or stalled:** Retry from the UI. Nothing commits on-chain until the wallet signs, so you can safely try again.
- **Missing vault or position:** Click **Retry indexing** or refresh—Firestore may be a few seconds behind the blockchain.
- **Unexpected permissions:** Confirm you picked the right network and wallet. Roles are evaluated per vault.
- **Need a hand:** Share the transaction hash from the toast, mention the doc you followed, and drop both in Telegram or GitHub.

### Keep this guide close

With this playbook nearby, teams can switch between borrowing and lending confidently. Each linked guide dives deeper when you need more detail.
