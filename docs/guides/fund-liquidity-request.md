# Fund a liquidity request

## TL;DR
- Time: 3–5 minutes once you’re comfortable with the flow.
- You need: a connected wallet, registration with the requested token, enough balance to cover principal + interest, and 1 yoctoNEAR for the transfer call.
- Outcome: your funds land in the vault, the request changes to **Active**, and your lender dashboard lists the position.

## Before you start
- **Review the request:** From [Discover](../features/discover.md) or the vault page, note the token, amount, interest, collateral, and duration. Decide if the APR matches your target and whether the collateral is acceptable.
- **Register with the token:** If the request uses USDC (default) or another NEP-141 token, make sure both you and the vault are registered. The UI surfaces a “Register with token” prompt if either account needs storage. Details: [Token registration](../reference/token-registration.md).
- **Check your balance:** You must hold the full amount you plan to lend. The UI shows the shortfall if you’re missing funds.

## Step-by-step

### 1. Open the funding dialog
- From the vault page, click **Fund request** (visible when the state is `pending` and you’re not the owner).
- The dialog explains the token, principal, interest you’ll receive, and the term length.

### 2. Confirm details
- Review the estimated APR and the memo the contract will record.
- If you want to propose different terms, look for the counter-offer option (coming soon); for now, only direct acceptance is supported.

### 3. Approve the transfer
- Click **Fund request**. Your wallet opens with a single `ft_transfer_call` to the requested token contract.
- We pass `amount` and a JSON message `{ action: "accept_liquidity_request", ... }`.
- Approve the transaction. We attach `ONE_YOCTO` for storage and the pre-set gas budget.

### 4. Let indexing finish
- After the wallet confirms, we trigger `/api/index_vault` so Firestore reflects the accepted offer.
- The request disappears from Discover and the vault shows **Active** with your account listed as the lender.
- Your lender dashboard updates within a few seconds (realtime Firestore) or on the next REST poll.

## Check it worked
- The vault page displays your account under **Active offer** along with the repay-by date.
- `Positions` tab in the dashboard shows the funded vault with status **Active**.
- You receive a toast with the transaction hash. Save it for support or accounting.

## If you hit a snag
- **Token not registered:** Register your wallet (and the vault if prompted) before attempting the transfer again.
- **Insufficient balance:** Top up your wallet with the required token. The dialog shows exactly how much more you need.
- **Transaction failed:** Check the wallet error message. Common causes include expired request, vault already funded, or slippage in decimals. Refresh the vault page to confirm the latest state.
- **Indexer pending:** Use **Retry indexing** on the vault page. Your funds are safe—the transfer either succeeded or the contract rejected it.

## After funding
- Monitor the countdown in your lender dashboard. When the owner repays, the position flips to **Closed** and your balance increases.
- If the term expires without repayment, the vault can enter liquidation. Watch for notifications or the liquidation banner on the vault page (coming soon).
- Keep the repayment hash when the owner settles—it confirms that your funds were returned with interest.
