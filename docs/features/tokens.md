# Tokens and balances

## TL;DR
- We ship with a tiny registry that knows about USDC on both testnet and mainnet.
- Helper hooks take care of metadata, balances, transfers, and the storage deposits required by NEP-141 tokens.
- If a token needs a different address, use `NEXT_PUBLIC_USDC_MAINNET_ID` (or extend the registry) and the UI will follow along.
- Vault owners and lenders rely on the same registry—owners to request liquidity, lenders to fund it—so keeping this list accurate helps everyone.

## Everyday tasks
- **Show token info:** `useTokenMetadata` returns the symbol, decimals, and icon for the active network.
- **Read balances:** `useFtBalance` loads the connected wallet’s token balance; `useAccountFtBalance` works for vault accounts.
- **Send tokens:** `useFtTransfer` wraps `ft_transfer`, handles minimal units, and shows friendly errors.
- **Register accounts:** `useFtStorage` checks whether the wallet or vault has paid the storage deposit and triggers `storage_deposit` when needed.

## Registry in practice
- `utils/tokens.ts` holds the current network map. It keeps things simple: token ID, symbol, decimals, and optional overrides.
- To add a token, extend the map with `{ networkId: { tokenId: { ... } } }`, then surface it in the UI selector.

## Why storage registration matters
- NEP-141 tokens need a small NEAR deposit before they can store balances for a new account.
- The UI spots gaps automatically and surfaces a one-click “Register with token” banner.
- Read the plain-language explainer in [Token registration](../reference/token-registration.md) if you want to know what happens under the hood.

## Pro tips
- Keep display strings in token units and convert to minimal units with the helpers—no manual `10 ** decimals` math needed.
- When debugging, open the token contract on NEAR Explorer from the UI so you can confirm balances or events quickly.
