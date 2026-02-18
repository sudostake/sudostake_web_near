# Networks

## TL;DR
- The app supports `testnet` and `mainnet`.
- Factory contracts differ by network.
- Network context determines RPC target, factory ID, token IDs, and explorer links.

## Network map

| Network | Factory | RPC upstream | Explorer base |
| --- | --- | --- | --- |
| testnet | `nzaza.testnet` | `https://rpc.testnet.fastnear.com` | `https://explorer.testnet.near.org` |
| mainnet | `sudostake.near` | `https://rpc.mainnet.fastnear.com` | `https://explorer.near.org` |

## Default request token IDs

| Network | Default USDC token ID |
| --- | --- |
| testnet | `3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af` |
| mainnet | `17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1` |

## App behavior
- JSON-RPC requests are proxied through `/api/rpc?network=<network>`.
- The header shows the active network.
- Request and balance flows use token config for the active network.

## Notes
- Current app UX does not expose a dedicated in-app network switch control.
- Default network is `testnet` unless configured otherwise.
