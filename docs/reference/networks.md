Networks and RPC

Supported networks

- testnet (default)
- mainnet

Factory contracts

- testnet: nzaza.testnet
- mainnet: sudostake.near

RPC endpoints

- testnet: https://rpc.testnet.fastnear.com
- mainnet: https://rpc.mainnet.fastnear.com

RPC proxy

- POST /api/rpc forwards JSON-RPC to the selected network (?network=testnet|mainnet)
- Wallet Selector uses the proxy for nodeUrl and the upstream for indexerUrl

Active network

- Stored in localStorage (selectedNetwork). Defaults to testnet if missing.
- utils/networks.ts has helpers to get/set it.
