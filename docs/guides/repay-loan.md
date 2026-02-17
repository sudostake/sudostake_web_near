# Repay a loan

## TL;DR
- Time: 2 to 5 minutes.
- Requirement: owner wallet connected and enough token balance inside the vault.
- Result: loan closes and lender claim is settled by repayment.

## Important timing
- Repayment is available while the loan is active.
- After expiry, repayment is still possible until liquidation begins.
- Once liquidation is in progress, use claim processing flow instead.

## Steps
1. Open the active loan vault page as owner.
2. Click `Repay now`.
3. In the repay dialog, check:
   - Principal
   - Interest
   - Total due
   - Current vault token balance
4. If vault balance is short:
   - Top up from owner wallet.
   - Complete token storage registration prompts if shown.
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
