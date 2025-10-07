# How SudoStake stays in sync

## TL;DR
- SudoStake keeps your dashboard fast by caching vault information off-chain while still trusting NEAR as the source of truth.
- Wallet Selector handles every connection so you can move between testnet and mainnet without reconfiguring anything.
- Whenever you complete an action (fund, request, repay), the app refreshes the vault directly from chain so everyone sees the same state.

## Before you dive in
- **Follow the flow:** Not sure where to start? The [SudoStake playbook](./playbook.md) walks vault owners and lenders through the full journey.
- **Pick a network:** Use testnet for rehearsals and mainnet for real funds. Factory IDs and explorer links live in [Network quick facts](./reference/networks.md).
- **Know what we store:** Curious about what the dashboard tracks for each vault? See [What the app stores](./reference/data-model.md).

## The moving parts (plain language)
### Wallets
- You connect once with Wallet Selector. It remembers your account and signs every transaction you approve.
- Switching the network toggle reconnects the selector so the right contracts and tokens appear automatically.

### Live vault data
- Think of the dashboard as a snapshot of your vault. Right after a transaction, the app fetches the fresh state from NEAR and updates the snapshot.
- If something looks out of date, the “Retry indexing” prompt forces a refresh—use it like a manual sync button.

### Behind-the-scenes safety
- Each vault action on the UI includes guardrails (for example, lenders can’t see owner-only buttons). Those checks rely on the latest vault snapshot and your connected wallet.
- If the snapshot says you’re the owner, you’ll see owner tools. If you’re the lender, you’ll see repayment status and reminders.

## Why this matters to you
- **Speed:** Cached data means the Discover page and dashboards load instantly, even before indexing finishes.
- **Accuracy:** Every meaningful click triggers a fresh read from the chain so balances and statuses stay trustworthy.
- **Simplicity:** You don’t need to manage RPC URLs or network IDs—SudoStake handles that once you pick a network.

## Need a deeper dive?
- [Indexing and consistency](./operations/indexing.md) explains what the “Retry indexing” dialog is doing in plain terms.
- [Tokens and balances](./features/tokens.md) shows how we keep wallet and vault balances tidy.
- [Who can do what](./reference/roles.md) spells out why certain buttons appear or stay hidden.
