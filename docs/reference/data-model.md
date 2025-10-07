# What the app stores

## TL;DR
- SudoStake keeps a simple record for every vault so the dashboard, Discover page, and lender views load instantly.
- Each record mirrors the important on-chain details (owner, current request, active lender) and adds a few timestamps for traceability.
- When you change something on-chain, the record refreshes automatically so everyone sees the update.

## Where your data lives
- Each network keeps its own list: `nzaza.testnet` for testnet vaults and `sudostake.near` for mainnet vaults.
- Every vault becomes one document keyed by the vault account ID (for example `vault-23.nzaza.testnet`).
- Switching the network toggle in the app simply swaps the list you’re viewing—nothing else to configure.

## What we remember for each vault
| What you’ll see | Why it matters |
| --------------- | -------------- |
| Vault owner | Shows who can deposit, delegate, open requests, and repay. |
| Current state (`idle`, `pending`, `active`) | Lets the UI surface the right actions (fund, repay, etc.). |
| Active liquidity request | Lists the token, amount, interest, collateral, and duration that lenders review. |
| Accepted offer | Records which lender funded the request and when repayment is due. |
| Staking activity | Tracks delegated validators and any pending unstake claims. |
| Safety notes | Flags liquidation status and timestamps the last update so you know the data is fresh. |

## How it stays up to date
1. You perform an action (mint, fund, repay, delegate).
2. The app fetches the latest vault state directly from NEAR.
3. The document above is rewritten, and the dashboard updates in real time.

If a refresh ever lags, tap **Retry indexing** on the banner—you’ll force steps 2 and 3 to run again.

## Need help interpreting a field?
- **Who can act:** Check [Who can do what](./reference/roles.md).
- **Why data looks delayed:** Read [Indexing and consistency](../operations/indexing.md).
- **Token balances:** See [Tokens and balances](../features/tokens.md) for how we show wallet and vault amounts.
