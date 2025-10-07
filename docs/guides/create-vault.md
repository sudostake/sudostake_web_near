# Mint a vault

## TL;DR
- Time: ~2 minutes once your wallet is connected.
- You need: a signed-in wallet, the active factory selected (testnet or mainnet), and enough NEAR to cover the one-time minting fee.
- Outcome: the factory creates `vault-<number>.<factory_id>`, we index it immediately, and it appears in your dashboard under **Vaults**.

## Before you start
- **Pick a network:** Switch the network toggle to testnet or mainnet before opening the dialog. The factory you choose is where the vault will live.
- **Check your wallet balance:** The mint fee is shown in the dialog (`CreateVaultDialog` uses `VAULT_CREATION_FEE`). Keep a little extra NEAR for follow-up actions.
- **Register with tokens (optional):** If you plan to borrow a token right away, register your wallet with that token now so you can fund collateral or repay later. See [Token registration](../reference/token-registration.md).

## Step-by-step

### 1. Open the dashboard
- Go to `/dashboard`. The page loads your wallet balances and existing vault list.
- Stay signed in; if you sign out, the dashboard redirects to the landing page.

### 2. Launch the “Create Vault” dialog
- In the **Vaults** tab, click **Create vault**.
- The dialog shows the total NEAR cost based on `VAULT_CREATION_FEE`.

### 3. Approve the transaction
- Click **Create Vault**. Your wallet opens with a single `mint_vault` call to the factory contract.
- Approve the transaction. We attach the minting deposit automatically; no manual edits needed.

### 4. Wait for indexing
- After the wallet confirms, we call `indexVault({ factoryId, vaultId, txHash })`.
- A short “Creating…” state appears while `/api/index_vault` fetches `get_vault_state` and writes the Firestore document.
- When indexing completes, the dialog closes and the new vault appears in your list with the next numeric ID.

## Check it worked
- The dashboard shows the new vault under **Vaults (1)** with zero balances.
- Clicking the vault opens `/dashboard/vault/<vaultId>` where you can deposit, delegate, or request liquidity.
- The toast includes the transaction hash so you can share it with support if needed.

## If something goes wrong
- **Wallet rejected:** Nothing is minted. Re-open the dialog when you’re ready.
- **Missing NEAR:** The wallet shows an insufficient balance error. Top up your wallet, then retry.
- **Indexer failed:** The vault exists on-chain but didn’t appear in the list. Use “Retry indexing” (if prompted) or refresh the dashboard; we refetch on mount.

## What to do next
- **Secure the vault:** Delegate NEAR to build collateral or transfer ownership if you minted on behalf of a team.
- **Open your first request:** Follow [Open a liquidity request](./opening-liquidity-request.md) once you’re ready to borrow.
- **Keep balances tidy:** Vault NEAR pays for gas when you unstake or repay. Deposit a small buffer now to avoid friction later.
