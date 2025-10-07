# Network quick facts

## TL;DR
- Use **testnet** to practice with play money and **mainnet** when you’re moving real funds.
- The toggle in the header controls everything—vault lists, token IDs, and which explorer links we show.
- Whatever network you pick stays saved locally, so you don’t have to choose again next time.

## Side-by-side comparison

| Network | When to use it | Factory account | RPC endpoint | Explorer |
| ------- | -------------- | --------------- | ------------ | -------- |
| testnet | Safe space to rehearse flows without risk. | `nzaza.testnet` | `https://rpc.testnet.fastnear.com` | [testnet.nearblocks.io](https://testnet.nearblocks.io) |
| mainnet | Live environment for real lenders and borrowers. | `sudostake.near` | `https://rpc.mainnet.fastnear.com` | [nearblocks.io](https://nearblocks.io) |

## What changes when you toggle
- **Vaults & requests:** You’ll see the vaults that belong to the selected network only.
- **Tokens:** The default token list (for example, USDC) swaps to the right contract ID for that network.
- **Wallet session:** Wallet Selector reconnects automatically, so you don’t need to log out or re-approve access.

## Practical tips
- Doing a dry run? Start on testnet, mint a vault, and walk through the whole request → repay cycle before switching to mainnet.
- Sharing a link with someone else? Mention the network in your message (“This is a testnet request…”) so they select the right toggle first.
- Need to inspect a transaction? Use the explorer link above—the vault and transaction hashes are the same ones shown in the UI toasts.
