# Repay an active loan

## TL;DR
- Time: 3–5 minutes once your vault holds the repayment token.
- You need: ownership of the vault, the borrowed token plus interest sitting in the vault balance, and 1 yoctoNEAR for the contract call.
- Outcome: the lender receives their funds, your vault returns to **Idle**, and the request disappears from lender dashboards.
- Lenders: skimming this guide helps you anticipate when funds land back in your account.

## Before you start
- **Open your vault dashboard** and check the active request card. It shows the token, principal, interest, and the total due.
- **Confirm the vault’s token balance.** If you’re short, top it up before attempting repayment.
- **Watch the timer.** You can repay any time before liquidation starts (the UI warns you if you’re close to expiry).

## Step-by-step

### 1. Open the repayment dialog
- Click **Repay loan** on the active request card.
- The dialog summarises what you owe and shows the vault’s current balance in the token.
- If the balance is short, we highlight the exact delta you need to add.

### 2. Top up if required
- Use the **Top up vault balance** helper to send the missing amount from your wallet to the vault.
- If the wallet or vault is not registered with the token, you’ll see a one-click **Register with token** button first.
- Once the balance is sufficient, the main **Repay now** button lights up.

### 3. Send the repayment
- Click **Repay now**. The wallet opens with a single `repay_loan` call to your vault.
- Review the details and approve. We attach 1 yoctoNEAR for access control; gas is estimated for you.
- Stay on the page while the transaction completes.

### 4. Let indexing refresh the state
- After the wallet reports success, we immediately trigger `/api/index_vault`.
- The status badge switches from **Active** to **Indexing…** for a few seconds.
- Once the refresh lands, the request card disappears and your vault status returns to **Idle**.

## Check it worked
- The vault dashboard shows no active request and lists the loan under **Activity → Repaid** (coming soon).
- Your lender no longer sees the position in their dashboard.
- The repayment toast includes the transaction hash so you can share proof if needed.

## If you hit a snag
- **Loan already liquidated:** The dialog disables repayment and points you to the claims flow. Reach out to support if you think it’s a mistake.
- **Insufficient balance:** Add the missing token amount and run **Repay now** again.
- **Wallet error:** Nothing leaves your vault until the wallet confirms success. Fix the issue (e.g., approval denied) and retry.
- **Indexer stuck:** Use **Retry indexing**. If the state still shows the loan, share the transaction hash with support.

## After repayment
- Consider delegating any remaining NEAR or resetting the collateral to prepare for the next request.
- Keep the repayment hash handy if you plan to reconcile with off-chain accounting tools.
- Let your lender know the repayment cleared; they’ll see the position drop off their dashboard, but a quick heads-up builds trust.
