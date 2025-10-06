API reference

Basics

- All routes live under /api
- Routes that read/write Firestore use Firebase Admin and need FIREBASE_SERVICE_ACCOUNT_KEY on the server

Routes

- POST /api/rpc
  - JSON-RPC proxy to NEAR (network=testnet|mainnet; default testnet)

- GET /api/view_pending_liquidity_requests?factory_id=<factoryId>&limit=<n>
  - Vaults with state = pending (limit optional; max 500)

- GET /api/view_lender_positions?factory_id=<factoryId>&lender_id=<accountId>
  - Vaults funded by lender_id, newest first

- GET /api/get_user_vaults?owner=<accountId>&factory_id=<factoryId>
  - List of vault IDs owned by the account under the factory

- GET /api/validators?network=<testnet|mainnet>
  - Default validators per network

- POST /api/index_vault
  - Body: { factory_id, vault, tx_hash }
  - Fetches get_vault_state, transforms, and saves to Firestore

Auth

- Wallet auth is client-side (Wallet Selector). API routes do not check the wallet session.
