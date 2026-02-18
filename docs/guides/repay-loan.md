# Repay a loan

## TL;DR
- Time: 2 to 5 minutes.
- Requirement: owner wallet connected; vault needs enough token balance to cover total due.
- Result: loan closes if repaid before liquidation starts.

## Important timing
- Repayment is available while the loan is active.
- After expiry, repayment is still possible until liquidation begins.
- Once liquidation is in progress, use claim processing flow instead.

## Steps
1. Open the active loan vault page as owner.
2. Click `Repay now`.
3. In the repay dialog, check principal, interest, total due, and vault token balance.
4. If vault balance is short, top up from your wallet and complete any storage registration prompts.
5. Click `Repay now` and approve in wallet (`repay_loan`).
6. Wait for indexing.

## After repayment
- Vault returns to `idle` (no active request).
- Lender position leaves active tracking once state updates.

## Common issues
- Missing vault token balance: top up then retry.
- Registration missing: complete wallet/vault registration prompts.
- Indexing lag: retry indexing if state does not refresh.

## Related
- [Vault actions](../features/vaults.md)
- [Token registration](../reference/token-registration.md)
