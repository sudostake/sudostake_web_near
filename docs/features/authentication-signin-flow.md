# Wallet sign-in flow

## TL;DR
- Connecting a wallet takes less than a minute: open the selector, approve the connection, and you’re ready to use protected actions.
- If anything goes wrong, the UI keeps you safe—no transaction is sent until the wallet confirms success.
- Signing out is instant and clears the session from both the selector and the UI.

## Step-by-step journey

### 1. First load
- Wallet Selector boots and learns which wallets are available on the current network.
- The header shows **Connect Wallet** unless you already have an active session.

### 2. Connect
- Click **Connect Wallet**. We call `signIn()` and hand off to the wallet you choose.
- Pick an account and approve access. If you close the popup, we surface a gentle “No worries—try again when you’re ready” message.

### 3. Redirect back
- After approval, Wallet Selector stores the session.
- The header switches to display your account name and opens the quick menu (copy account, switch network, sign out).

### 4. While you’re signed in
- Actions that move funds (create vault, request liquidity, repay loans) become available.
- Read-only browsing stays open to everyone. If you switch accounts in your wallet, the selector relays the change and the UI updates automatically.

### 5. Sign out
- Use the quick menu → **Sign out**. We call `signOut()` and clear cached keys.
- The header returns to **Connect Wallet**, and guarded actions lock again.

## Safety checks we surface
- **Network hiccup:** We catch the error and show “Please try again.” Nothing is sent to the blockchain.
- **Popup blocked:** Browsers sometimes block the wallet window. We trigger the wallet’s full-page redirect if needed.
- **Expired session:** If the wallet revokes the access key, the selector notifies us; we sign you out and show a short notice so you can reconnect.

## Ideas on deck
- Skeleton states for gated sections so pages don’t flash when the session changes.
- Faster account switching without a full sign-out cycle.
