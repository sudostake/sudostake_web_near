Viewer roles and UI gating

This app derives viewer roles from on-chain indexed vault state (see sudostake_contracts_near/contracts/vault/src/types.rs and view.rs) and the connected wallet.

Roles

- guest: no connected wallet
- owner: connected wallet matches vault.owner
- activeLender: connected wallet matches accepted_offer.lender
- potentialLender: connected wallet, but neither owner nor active lender

How it’s computed

- Hook: hooks/useViewerRole.ts uses the wallet selector and the indexed vault document (useVault) to determine the role.
- Source of truth: VaultDocument mirrors the contract view (get_vault_state), including owner and accepted_offer.lender.

Current UI rules

- Liquidity requests
  - Only the owner can open or cancel a liquidity request in the UI.
  - Non-owners see the current request details when present, but no action buttons.
- Vault actions
  - Deposit, Withdraw, Delegate, Undelegate, and Claim Unstaked dialogs are only rendered for the owner.
  - Delegations summary remains visible to all viewers; onboarding CTAs are disabled unless the viewer is the owner.

Contract reference

- Only the vault owner may call request_liquidity (1 yoctoNEAR required).
- Accepted offer stores the lender account; this determines the activeLender role.

