# Tokens and balances

## TL;DR
- The app currently centers on USDC lending with NEAR collateral.
- Token storage registration checks are built into request, funding, and repayment flows.
- Wallet and vault balances are shown where actions depend on them.

## Current token behavior
- Request creation dialog uses the default USDC token for the active network.
- Discover cards use token metadata from on-chain `ft_metadata` with registry fallback.
- Vault request panels use app token config and token decimals for formatting.
- Dialogs convert display values to minimal units before contract calls.

## Where balances appear
- Dashboard summary: wallet NEAR and USDC.
- Vault header and dialogs: vault NEAR and token balances.
- Repay dialog: total due vs current vault token balance.

## Storage registration
- If wallet or vault is not registered with a token, the app shows registration actions.
- Registration uses token `storage_deposit` with the required minimum.

## Related
- [Token registration reference](../reference/token-registration.md)
- [Fund a request](../guides/fund-liquidity-request.md)
- [Repay a loan](../guides/repay-loan.md)
