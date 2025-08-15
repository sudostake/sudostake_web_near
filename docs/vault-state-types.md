# Vault State Types

## Overview
- The on-chain view method get_vault_state returns a full VaultViewState.
- VaultViewState is the single source of truth for the contract’s returned shape and lives at utils/types/vault_view_state.ts.
- The transformer at utils/transformers/transform_vault_state.ts consumes the fields it needs from VaultViewState and outputs TransformedVaultState for persistence and downstream use.

## How to Use
- Import VaultViewState anywhere you need to work with the raw on-chain view data.
- When you only need a subset of fields, select them locally (e.g., via pick/explicit property access) rather than introducing a parallel type.
- If you require the normalized/persisted representation, use the transformer to produce TransformedVaultState.

## Benefits
- One canonical type that mirrors the contract response.
- Clear ownership boundary: contracts define VaultViewState; application code selectively consumes from it and transforms when needed.
- Fewer types to maintain as the contract evolves.
