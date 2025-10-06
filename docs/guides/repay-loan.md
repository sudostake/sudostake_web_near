Repayment (loan) – implementation plan

High-level goal

- Allow a vault owner to repay an active loan (principal + interest) in the requested FT (e.g., USDC) before liquidation begins.
- Provide a clear, safe UX with preflight checks, a top-up path for the vault’s FT balance, and robust post‑tx indexing with automatic UI updates.

Contract baseline (already implemented in sudostake_contracts_near)

- Method: vault.repay_loan() [payable 1 yoctoNEAR]
  - Access: only the vault owner.
  - Preconditions:
    - liquidity_request is Some
    - accepted_offer is Some (loan is active)
    - liquidation is None (repayment is rejected after liquidation starts)
  - Behavior: transfers (amount + interest) of the requested FT from the vault to the lender, then clears liquidity_request and accepted_offer on success. Emits events repay_loan_successful or repay_loan_failed.
- Related flows:
  - process_claims() runs liquidation after expiry; once liquidation starts, repay_loan is no longer allowed.

UI/UX requirements (web)

1) Show repay CTA when appropriate
- Where: Dashboard → Vault → LiquidityRequestsCard, for the vault owner.
- Conditions to show “Repay loan” button:
  - data.state === "active"
  - data.liquidity_request exists (has token, amount, interest, duration)
  - data.accepted_offer exists
  - data.liquidation is undefined
- Display context:
  - Show countdown to expiry (already implemented) and acceptance timestamp.
  - Show the vault’s FT balance for the request token (e.g., USDC). This is already loaded on the page (usdc for the default token); extend to fallback to the request token if it is not the default.

2) Repay dialog
- Modal content:
  - Token, principal, interest, total due = principal + interest (format using request token decimals)
  - Vault’s current balance in the FT token and computed delta needed (if any)
  - Warnings
    - If the loan is past its duration: “Repayment may be blocked if liquidation is triggered by any party.”
    - If liquidation is active (liquidation present): disable and explain repayment is no longer possible; offer to “View claims” (future)
- Actions:
  - If balance is sufficient: enable “Repay now”
  - If balance is insufficient: disable “Repay now” and show a “Top up vault balance” helper with a convenience transfer from owner → vault for the missing amount
    - If owner is not registered with token: offer “Register owner with token” using existing useFtStorage hook
    - If vault is not registered (should not happen for accepted loans, but guard older state): offer “Register vault with token” using useFtStorage

3) Post-transaction behavior
- On repay success:
  - Trigger indexing (useIndexVault) with the returned tx hash so Firestore reflects cleared accepted_offer and liquidity_request
  - Automatically update vault FT balance (useAccountFtBalance) and any displayed available balances via refetch side effects
  - Toast/inline success message
- On failure:
  - Show concise error via getFriendlyErrorMessage; keep dialog open with retry option

Hooks and utilities to add

- useRepayLoan
  - Signature: repayLoan({ vault }): Promise<{ txHash: string }>
  - Implementation: wallet.signAndSendTransaction with a single FunctionCall
    - receiverId: vault
    - method: "repay_loan"
    - args: {}
    - gas: DEFAULT_GAS
    - deposit: ONE_YOCTO
  - State: { pending, error, success }
  - Export friendly errors via getFriendlyErrorMessage

- useFtTransfer (owner → vault top‑up)
  - Signature: ftTransfer({ token, receiverId, amountMinimal }): Promise<{ txHash: string }>
  - Implementation: signAndSendTransaction to token
    - method: "ft_transfer"
    - args: { receiver_id, amount, memo: null }
    - gas: DEFAULT_GAS
    - deposit: ONE_YOCTO
  - Consider reusing useFtBalance formatting helpers and token decimals utilities to compute minimal units from a display string in the dialog, but the repayment dialog can compute and pass already‑minimal deltas from request data.

Components and wiring

- RepayLoanDialog
  - Props: { open, onClose, vaultId, requestTokenId, principalMinimal, interestMinimal, onSuccess }
  - Internals
    - Derive decimals/symbol via getTokenConfigById/getTokenDecimals
    - Compute totalDueMinimal = BigInt(principalMinimal) + BigInt(interestMinimal)
    - Query vault token balance (useAccountFtBalance) and check sufficiency
    - If insufficient, compute missingMinimal and show a top‑up action using useFtTransfer
    - Primary button calls useRepayLoan().repayLoan(); on success: indexVault, then call onSuccess

- LiquidityRequestsCard
  - Replace the placeholder “Repay loan (soon)” with opening RepayLoanDialog and pass required props from data.liquidity_request
  - Also surface a small helper line like “Total due: X TOKEN” in the “Current request” panel when state === "active"

Edge cases and safeguards

- Past expiry but liquidation not yet started
  - Contract allows repay_loan until liquidation is started; show a warning and still allow repayment

- Liquidation active
  - Repay button disabled; guide owner to process claims flow (not in scope here)

- Registration gaps
  - Lender side: irrelevant for repay
  - Owner side: needs registration with token only if doing a top‑up transfer from owner → vault; provide register button using useFtStorage
  - Vault side: should already be registered for accepted request; if not, provide a register button (useFtStorage)

- Token decimal precision and display
  - Use formatMinimalTokenAmount for display
  - Keep all on‑chain values in minimal units; toMinimalTokenAmount utility can be reused if accepting display inputs in top‑up helper

- Concurrency/locks
  - The contract uses a processing lock for RepayLoan; UI should prevent duplicate clicks via pending state

- Error surfaces
  - Insufficient vault token balance
  - Wallet rejected/signature declined
  - ft_transfer failure in callback (on_repay_loan) — surfaced only by state not clearing after index; show generic failure toast suggesting retry

Indexing considerations

- The indexer should already interpret repay_loan_successful by observing state changes (liquidity_request and accepted_offer cleared). We will proactively call /api/index_vault with txHash after the wallet call resolves to speed up UI updates.

QA checklist

- Owner with sufficient vault USDC can repay before expiry; vault state transitions to idle; Firestore reflects cleared request and accepted_offer.
- Owner with insufficient vault USDC sees required delta and can top up from their account (after registering owner with token if needed).
- After expiry, before liquidation triggered: repayment still allowed; show warning.
- After liquidation begins: repay button disabled with explanation; owner cannot repay.
- Lender view: “You funded this request” banner disappears after repayment; vault USDC decreases; owner’s vault returns to idle.
- All transactions attach 1 yoctoNEAR and safe gas amounts; errors are meaningfully displayed.

Future enhancements

- Partial repayments (contract support would be needed).
- One‑click “Top up and repay” batched flow via ft_transfer followed by repay_loan (consider wallet’s multiple-actions UX).
- Support non‑default tokens uniformly for balances and formatting throughout the page.

