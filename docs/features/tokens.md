Tokens and balances

Overview

We keep a small token registry for what we need today (USDC), and helpers to read balances and handle storage registration.

What works

- Token registry by network (USDC on testnet and mainnet)
- Optional env override for the mainnet USDC implicit account (NEXT_PUBLIC_USDC_MAINNET_ID)
- Helpers for FT storage, balances, and transfers

Related docs and code

- reference/token-registration.md – Why registration is needed and how it works
- utils/tokens.ts – Token registry and helpers
- hooks/useTokenMetadata.ts – Metadata
- hooks/useFtBalance.ts, hooks/useAccountFtBalance.ts – Balances
- hooks/useFtTransfer.ts – Transfers
- hooks/useFtStorage.ts – Storage deposits
