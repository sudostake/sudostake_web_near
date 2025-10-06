Sign-in and sign-out flow

This is the simple path a user takes when connecting a wallet.

1) First load
- The app initializes Wallet Selector.
- The top-right button shows “Connect Wallet” (or “Logout [account]” if already connected).

2) Sign in
- The user clicks “Connect Wallet”. We call signIn().
- The wallet opens. The user picks an account and approves access.
- If the user cancels, we show a small notice and they stay signed out.

3) After redirect
- Wallet Selector reads the returned data and stores the session.
- The UI updates to show the connected account.

4) Signed-in experience
- Gate actions that require a wallet (e.g., creating a vault) and keep read-only browsing open to everyone.
- If the user switches accounts in their wallet, we update the UI to match.

5) Sign out
- The user clicks “Logout”. We call signOut() and clear the session.
- The UI returns to “Connect Wallet”.

Common issues and how we handle them
- Network error during sign-in → show a simple “Please try again” message.
- Popup blocked → fall back to a full-page redirect.
- Session expired or key revoked → automatically sign out and show a short notice.

What to improve next
- Add loading skeletons for protected content.
- Support quick account switching.
