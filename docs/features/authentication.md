Authentication (Wallet sign-in)

Overview

- We use NEAR Wallet Selector. Supported wallets: Bitte, Meteor, MyNearWallet, Ledger, Nightly.
- The app picks a network (testnet by default) and sends RPC calls through /api/rpc.

What works today

- Connect and disconnect
- Read the current account from the useWalletSelector hook
- Show the connected account in the top navigation with a quick menu

Where it lives

- app/providers.tsx – WalletSelectorProvider configuration (uses /api/rpc)
- app/components/Navigation.tsx – Connect/Logout button and account menu
- features/authentication-signin-flow.md – The full sign-in flow in plain English
