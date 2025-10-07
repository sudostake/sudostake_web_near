# Token registration (NEP-141)

## TL;DR
- NEP-141 tokens ask every account to pre-pay a tiny NEAR deposit so they can store balances and allowances.
- You must register both the vault (to receive tokens) and the lender wallet (to send tokens) before transfers succeed.
- The app checks this automatically and gives you a one-click “Register with token” button whenever it spots a gap.

## Why it exists
- Token contracts store data on-chain. Without a storage deposit, they reject transfers to avoid unpaid storage.
- The deposit is small (usually under 0.002 NEAR) and stays with the token contract as long as you hold a balance.

## How to register manually
1. Call `storage_balance_bounds` on the token to learn the minimum deposit.
2. Call `storage_deposit` and pass the account ID you want to register (vault or wallet). Attach at least the minimum deposit and 1 yoctoNEAR.
3. After the transaction lands, the token contract can store balances for that account and future transfers will succeed.

## Can I get the deposit back?
- Some tokens let you call `storage_unregister` to reclaim the deposit after you empty your balance and clear allowances.
- Others keep the deposit permanently. Always check the token contract documentation.

## In the SudoStake UI
- We automatically detect registration gaps for both lenders and vault owners.
- You’ll see a small helper card with “Register wallet with USDC” or “Register vault with USDC.” One click sends the deposit.
- Use the Explorer link in the same card if you want to inspect your registration status directly on NEAR Explorer.
