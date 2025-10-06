Data model

Firestore collections

- One collection per factory (e.g., nzaza.testnet, sudostake.near)
- One document per vault (id = vault account id)

Types

- VaultViewState – Raw view from the contract (get_vault_state)
- TransformedVaultState – UI-friendly fields from the view state
  - owner, state (idle|pending|active), liquidity_request, accepted_offer, unstake_entries, current_epoch, liquidation
- VaultDocument – What we store in Firestore
  - TransformedVaultState + factory_id, tx_hash, created_at, updated_at

Common queries

- By owner (user’s vaults)
- By state = pending (discover)
- By accepted_offer.lender (lender positions)
