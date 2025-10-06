Indexing: keeping Firestore in sync

Why indexing exists

After you send a transaction, the chain updates first. Firestore follows. Some screens need the latest state. Indexing closes that gap.

How it works

1) You finish an action that changes a vault.
2) If fresh data is required, the app shows a small modal that blocks the next step.
3) Clicking “Retry indexing” calls POST /api/index_vault with { factory_id, vault, tx_hash }.
4) The server fetches get_vault_state, transforms it, and writes a VaultDocument to Firestore.
5) The modal closes and you can continue.

Notes

- The indexing blocker stores the job in localStorage so a refresh won’t lose it.
- /api/index_vault retries briefly when the vault isn’t visible yet.

Related code

- hooks/useIndexingBlocker.tsx – Provider and modal
- app/api/index_vault/route.ts – Server endpoint
- utils/indexing/service.ts – Fetch, transform, persist
- utils/db/vaults.ts – Firestore helpers
