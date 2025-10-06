Vaults: lifecycle and actions

Overview

A vault is a NEAR account created by the factory. We also store a copy of its important on-chain fields in Firestore so the UI can load fast. If you need fresh data, call /api/index_vault to re-index the vault.

What you can do

- Create a vault – useCreateVault
- Request liquidity – useRequestLiquidity
- Accept a request (lender) – useAcceptLiquidityRequest
- Repay a loan – useRepayLoan
- Deposit / Withdraw – useDeposit, useWithdraw
- Delegate / Undelegate / Claim – useDelegate, useUndelegate, useClaimUnstaked
- Transfer ownership – useTransferOwnership
- Index the vault – useIndexVault (client) and /api/index_vault (server)

Data we store

- VaultDocument – Firestore document per vault (collection = factory id, doc id = vault account)
- Includes: state, liquidity_request, accepted_offer, unstake_entries, current_epoch, and timestamps
- See reference/data-model.md for details

Keeping data in sync (indexing)

- After a transaction, Firestore might lag the chain.
- The app shows a small blocker if fresh data is required and lets you “Retry indexing”.
- See operations/indexing.md.

Related code

- hooks/ – the hooks listed above
- app/api/index_vault/route.ts – server entry point
- utils/indexing/service.ts – fetch, transform, save
- utils/db/vaults.ts – Firestore helpers

More info

- Viewer roles: reference/roles.md
- Open a request: guides/opening-liquidity-request.md
- Repay a loan: guides/repay-loan.md
