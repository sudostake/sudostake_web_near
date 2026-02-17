# Tokens and balances

## TL;DR
- The app currently centers on USDC lending with NEAR collateral.
- Token storage registration is checked in funding and repayment flows.
- Balances are shown for wallet and vault where relevant.

## Current token behavior
- Request creation dialog uses the default USDC token for the active network.
- Discover and vault views render token metadata from registry + on-chain metadata.
- Amounts are converted between display and minimal units in dialogs/hooks.

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
