# Tokens and balances

## TL;DR
- SudoStake recognises the tokens you’ll use most (USDC on both testnet and mainnet) so amounts, icons, and balances just work.
- The app checks whether your wallet or vault needs a storage deposit before you move tokens and gives you a one-click fix if it does.
- Vault owners and lenders look at the same token data, keeping both sides aligned on symbols, decimals, and balances.

## What you can do in the UI
- **Check balances:** Wallet balances show up in the header and dashboard; vault balances display on each vault page.
- **Register for a token:** If you or your vault isn’t registered, you’ll see a banner with a single button to pay the tiny storage deposit.
- **Send funds to the vault:** The deposit dialog lets you top up NEAR. Token transfers use the same pattern—pick the token, enter the amount, approve in your wallet.
- **See token details:** Hover tooltips and summary cards reveal the symbol, decimals, and which network the token belongs to.

## Why the registry helps
- We pre-fill the correct contract IDs so you never have to copy/paste them.
- Amounts stay human-friendly because we know how many decimals each token uses.
- When the team adds a new supported token, it automatically appears in the dialogs—no manual setup on your side.

## Why storage registration matters
- NEP-141 tokens need a small NEAR deposit before they can store balances for a new account.
- The UI spots gaps automatically and surfaces a one-click “Register with token” banner.
- Read the plain-language explainer in [Token registration](../reference/token-registration.md) if you want to know what happens under the hood.

## Pro tips
- Keep a little NEAR in your vault so you can pay storage deposits or gas without moving funds around at the last minute.
- If a balance looks off, press **Retry indexing** to fetch the latest state from the chain.
- Need to double-check something on-chain? Use the explorer links in the UI—they already point to the right contract for the active network.
