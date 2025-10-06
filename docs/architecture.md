Architecture overview

This app is a Next.js frontend. It talks to NEAR for chain data and to Firestore for fast reads. Here’s the simple picture:

- Wallets: NEAR Wallet Selector handles connect, sign, and send.
- Chain reads: the app calls our /api/rpc proxy, which forwards requests to NEAR RPC (no CORS issues).
- Indexed data: we store a cleaned-up copy of on-chain vault state in Firestore for quick queries.
- Realtime or REST: views can subscribe to Firestore directly, or use REST endpoints that read from Firestore.

Networks and factory contracts

- Supported networks: testnet and mainnet
- Each network has a factory contract (e.g., nzaza.testnet). We use the factory id as the Firestore collection name.
- See reference/networks.md for exact values.

How data flows

1) The server fetches on-chain vault state via NEAR RPC (get_vault_state).
2) It transforms that into a VaultDocument and writes it to Firestore.
3) The UI reads from Firestore (realtime) or via REST endpoints.
4) If the UI needs fresher data, it can call /api/index_vault to re-index a vault and update Firestore.

Firebase

- Client: firebase/app + firebase/firestore for realtime reads.
- Server: firebase-admin for reading/writing Firestore in API routes.

RPC proxy

- POST /api/rpc forwards JSON-RPC to the selected network. This avoids CORS issues and centralizes network selection.

Where data lives

- Firestore
  - One collection per factory (e.g., nzaza.testnet, sudostake.near)
  - One document per vault (keyed by the vault account id)
  - See reference/data-model.md for fields

Feature flags

- NEXT_PUBLIC_LENDING_USE_API and NEXT_PUBLIC_PENDING_USE_API control whether a view uses REST polling or Firestore realtime.
