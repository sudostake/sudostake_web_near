# Open a liquidity request

## TL;DR
- Time: about 5 minutes once your vault has collateral.
- You need: a vault, a NEAR wallet with a bit of NEAR for gas, and any stake you want counted as collateral.
- Outcome: your request appears on Discover so lenders can fund it. If collateral is too low, the request is rejected and nothing leaves your vault.
- Still exploring? Walk through the steps in read-only mode first; mint a vault only after you’re comfortable with the flow.

## Before you start
- **Confirm your vault:** From the dashboard, open the vault you want to fund. If you still need one, follow [Mint a vault](./create-vault.md) first.
- **Check collateral:** Only staked NEAR counts. Delegate more stake first if you want a larger loan limit.
- **Know your numbers:** Decide the token (USDC by default), amount you want to borrow, interest you’re offering, collateral you’re willing to lock, and how long you need the funds.
- **New owners:** Make sure your wallet is registered with the token you’ll borrow and keep at least 0.1 NEAR in the vault for safety margins.

## Step-by-step

### 1. Open the request form
- In your vault dashboard, click **Request liquidity**.
- The form pre-fills the default stablecoin and a suggested interest rate; adjust as needed.

### 2. Enter the details
- **Token:** Pick the NEP-141 token you want to borrow. We show symbol and decimals so you know the unit.
- **Amount:** Enter it in display units (for USDC, whole dollars). We convert to minimal units for the contract.
- **Interest:** Set the total interest you’re willing to pay back.
- **Collateral:** Enter the NEAR amount you will lock. Remember, only staked NEAR counts.
- **Duration:** Choose how many days you need the funds. We turn this into seconds when we send the transaction.

Heads up: you must keep 1 yoctoNEAR in your wallet for the contract call. We handle the gas estimate automatically.

### 3. Review and send
- Double-check the summary pane. It shows the total you’ll repay (amount + interest) and the collateral check.
- Click **Request liquidity**. Your wallet opens and asks you to approve a single transaction to your vault with method `request_liquidity`.
- Approve the transaction. If you close the wallet, nothing is sent and you stay on the form.

### 4. Let indexing finish
- After the wallet confirms, we trigger `/api/index_vault` to refresh the vault from chain.
- You’ll see a small “Indexing…” banner for a few seconds. Once it clears, your request appears on Discover.
- If indexing fails or takes too long, tap **Retry indexing**.

## Check it worked
- Your vault status switches to **Pending** with the request details.
- The Discover page lists your request with the same numbers.
- You receive a confirmation toast with the transaction hash (handy for support).

## If something goes wrong
- **“Insufficient collateral” error:** Stake more NEAR from the vault, then retry. Liquid NEAR in the vault does not count.
- **Wallet shows a failure:** Nothing is locked. Fix the issue (e.g., insufficient balance) and re-open the form.
- **Still pending indexing:** Press **Retry indexing**. If it persists, share the transaction hash with support.

## Next steps
- Share the request link with lenders or let it surface on Discover.
- Monitor incoming offers from the dashboard. You’ll see counter-offers and direct acceptances in real time.
- Ready for the other side of the journey? Read [Repay a loan](./repay-loan.md).
