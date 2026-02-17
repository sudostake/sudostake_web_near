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

## App behavior
- JSON-RPC requests are proxied through `/api/rpc?network=<network>`.
- The header shows the active network.
- Request and balance flows use token config for the active network.

## Notes
- Current app UX does not expose a dedicated in-app network switch control.
- Default network is `testnet` unless configured otherwise.
