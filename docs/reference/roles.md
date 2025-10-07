# Viewer roles

## TL;DR
- The UI tailors actions based on who is looking at a vault: guest, owner, active lender, or curious lender.
- Roles are derived from the connected wallet and the latest Firestore copy of the vault.
- Understanding these rules helps you explain why certain buttons appear or stay hidden.
- Planning to become a vault owner or lender? Check which capabilities unlock when you connect so you know what to expect.

## Role definitions
- **Guest** — No wallet connected. Can browse public data only.
- **Owner** — Connected wallet matches `vault.owner`. Gets full control over requests, staking, and ownership.
- **Active lender** — Connected wallet matches `accepted_offer.lender`. Sees repayment status and relevant callouts.
- **Potential lender** — Wallet connected but not the owner or active lender. Can view details and, if the vault is pending, fund or counter-offer.

## How we compute the role
1. `hooks/useWalletSelector` exposes the connected account (if any).
2. `hooks/useVault` loads the Firestore document for the vault in view.
3. `hooks/useViewerRole` compares the wallet account with fields inside the document and returns the role string.

This all runs client-side so the UI updates instantly when a wallet connects, disconnects, or switches accounts.

## UI rules (current)
- **Liquidity requests**
  - Only owners see the buttons to open, cancel, or edit a request.
  - Potential lenders see funding CTAs if the state is `pending`.
  - Active lenders see repayment status and timeline.
- **Vault actions**
  - Deposit, withdraw, delegate, undelegate, and claim dialogs render for the owner only.
  - Delegations summary and historical activity stay visible to everyone.
  - Transfer ownership is owner-only and requires the 1 yoctoNEAR confirmation transaction.
- **Discover and lender dashboards**
  - Discover hides owner-only actions, but highlights if your wallet could fund the request.
  - Lender positions only load when you connect a wallet; otherwise we prompt you to connect.

## Contract guardrails (for reference)
- Only the vault owner can call `request_liquidity`, `cancel_liquidity_request`, `repay_loan`, or `transfer_ownership`.
- Accepted offers store the lender account, which becomes the source of truth for the active lender role.

If you adjust the contract permissions, update these notes so support and docs stay aligned with the latest behaviour.
