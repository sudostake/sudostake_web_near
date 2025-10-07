# Connect your wallet

## TL;DR
- We rely on NEAR Wallet Selector, so the same “Connect Wallet” flow works with Bitte, Meteor, MyNearWallet, Ledger, Nightly, and future wallets that plug into the selector.
- Once you connect, the top navigation shows your account and unlocks actions like creating a vault or accepting a loan.
- All RPC calls flow through `/api/rpc`, so switching between testnet and mainnet is safe and consistent.

## What happens when you connect
1. **Wallet Selector boots up** inside `app/providers.tsx` and knows which wallets are available.
2. **You tap “Connect Wallet”.** We call `signIn()` from the selector.
3. **Your chosen wallet opens.** Pick an account and approve access. If you cancel, we surface a friendly notice and you stay signed out.
4. **Selector stores the session.** After redirect, the header updates to show your account name and the quick menu (copy account, switch network, sign out).
5. **Actions unlock.** Hooks like `useWalletSelector()` return your account ID so features can gate risky actions while keeping read-only pages open to everyone.

Read the full moment-by-moment breakdown in [Sign-in flow](./authentication-signin-flow.md).

## Where to look in the code
- `app/providers.tsx` — WalletSelectorProvider configuration and network routing.
- `app/components/Navigation.tsx` — Connect/logout button, quick account menu, and handoff to feature pages.
- `hooks/useWalletSelector.ts` — Lightweight hook that surfaces the selector instance and active account to any component.

## Troubleshooting quick wins
- **Button does nothing:** Check that the selector scripts loaded. In dev, refresh with cache disabled.
- **Wallet popup blocked:** Browsers sometimes block new windows. We fall back to full-page redirects, but you can also allow popups for the site.
- **Account mismatch:** If you switch accounts inside the wallet, the selector notices and the UI updates automatically. If not, click “Logout” then reconnect.
