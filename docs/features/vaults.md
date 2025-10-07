# Vaults: everyday actions

## TL;DR
- A vault is your project’s NEAR account. The factory mints it, and we keep a live copy of its crucial fields in Firestore so dashboards update instantly.
- Every big move—requesting liquidity, funding, repaying, staking—has a matching hook and guide so you can go from idea to action quickly.
- If the data ever looks stale, hit **Retry indexing** and we refresh the vault straight from chain.
- Thinking about opening your first vault? Follow the checklist below before you mint anything.

## Vault at a glance
- **Identity:** `vault-<number>.<factory_id>` (auto-created by the factory contract).
- **State:** `idle`, `pending`, `active`, or `closed` based on liquidity status.
- **Mirror:** Firestore stores `liquidity_request`, `accepted_offer`, staking entries, and timestamps so the UI renders immediately.

## What you can do today
- **Create a vault** — `useCreateVault` handles the mint + init flow.
- **Request liquidity** — `useRequestLiquidity` sends `request_liquidity` with a friendly form (see the [guide](../guides/opening-liquidity-request.md)).
- **Accept as a lender** — `useAcceptLiquidityRequest` posts the funds and locks the offer.
- **Repay the loan** — `useRepayLoan` pays principal + interest back to the lender (see [Repay a loan](../guides/repay-loan.md)).
- **Manage NEAR balances** — `useDeposit`, `useWithdraw`, `useDelegate`, `useUndelegate`, `useClaimUnstaked`.
- **Transfer ownership** — `useTransferOwnership` lets you hand the vault to a new controller.
- **Force a refresh** — `useIndexVault` (client) or `POST /api/index_vault` (server) re-fetches on-chain state and rewrites the Firestore copy.

## Data that powers the UI
- Each factory becomes a Firestore collection; each vault is a document identified by its account ID.
- Key fields: overall `state`, pending request details, active offer info, staking entries, `current_epoch`, and audit timestamps.
- Full schema: [Data model](../reference/data-model.md).

## Keeping the view fresh
- Transactions settle on-chain instantly but Firestore might lag for a few seconds.
- The UI blocks actions that need up-to-the-minute data and shows a **Retry indexing** button. That hits `/api/index_vault` which:
  1. Calls `get_vault_state`.
  2. Transforms the response into a `VaultDocument`.
  3. Writes it back to Firestore.
- Operations deep dive: [Indexing and consistency](../operations/indexing.md).

## Where to look in the repo
- `hooks/` — all the hooks listed above live here with typed responses and loading states.
- `utils/indexing/service.ts` — fetch-transform-save logic.
- `utils/db/vaults.ts` — shared Firestore helpers.
- `app/api/index_vault/route.ts` — manual indexing endpoint.

## Related paths
- [Viewer roles](../reference/roles.md) explain who can see or do what.
- [Open a liquidity request](../guides/opening-liquidity-request.md).
- [Repay a loan](../guides/repay-loan.md).
- **New here?** Make sure your wallet is registered with the lending token, hold a little NEAR for gas, and skim [Open a liquidity request](../guides/opening-liquidity-request.md) before you mint a vault.
