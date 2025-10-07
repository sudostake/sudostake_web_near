# Networks and RPC

## TL;DR
- SudoStake ships with two networks: **testnet** (default) and **mainnet**. Switching networks swaps factory IDs, RPC hosts, and token lists.
- All blockchain calls go through `/api/rpc`, so the browser never talks to NEAR directly.
- The selected network is stored locally so the app remembers your choice across sessions.

## Factories and endpoints

| Network | Factory contract | RPC endpoint | Explorer |
| ------- | ---------------- | ------------ | -------- |
| testnet | `nzaza.testnet` | `https://rpc.testnet.fastnear.com` | https://testnet.nearblocks.io |
| mainnet | `sudostake.near` | `https://rpc.mainnet.fastnear.com` | https://nearblocks.io |

## Active network logic
- The selector defaults to **testnet**.
- We store the preference in `localStorage` under `selectedNetwork`.
- Helpers in `utils/networks.ts` manage read/write so components stay in sync.

## RPC proxy
- Route: `POST /api/rpc?network=testnet|mainnet` (query param optional—defaults to `testnet`).
- Body: standard NEAR JSON-RPC payload `{ "method": "query", "params": … }`.
- Benefits: avoids browser CORS limits, centralises retries, and lets us log or rate limit by method.

## Wallet selector integration
- When you change networks, the wallet selector reconnects with the correct `nodeUrl` and `indexerUrl`.
- Feature pages listen for the network change and swap data sources and token metadata automatically.

## Tips
- Need to add another network (e.g., a staging factory)? Extend `utils/networks.ts` and add the RPC host, factory ID, and token metadata. Update this page so everyone knows the new IDs.
- When debugging RPC calls, use the browser devtools network tab—you’ll see `/api/rpc` POSTs with the actual JSON payload.
