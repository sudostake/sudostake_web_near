# Viewer roles

## TL;DR
- The app decides which buttons to show based on who you are in relation to the vault: guest, owner, active lender, or interested lender.
- Once you connect a wallet, the correct set of tools appears automatically—no extra configuration needed.
- If something seems missing, use this guide to double-check which role you’re in.

## Roles at a glance
- **Guest** — You have not connected a wallet yet. Browse requests and vault details, but you can’t take any actions.
- **Vault owner** — Your connected wallet matches the vault owner. You can deposit, delegate, open or cancel requests, repay, and transfer ownership.
- **Active lender** — You funded the current request. You’ll see repayment status, loan details, and reminders.
- **Potential lender** — You’re connected with a wallet that hasn’t funded this vault. You can review the request and, if it’s open, fund it.

## What you’ll see in the UI
- **Opening or managing requests:** Only vault owners can open, edit, or cancel a liquidity request.
- **Funding:** Potential lenders get the “Fund request” button while the state is **Pending**. Once you fund it, the button disappears and the status changes to **Active**.
- **Vault tools:** Deposit, withdraw, delegate, and transfer ownership buttons remain owner-only. Everyone else can still view balances and delegations.
- **Lender dashboard:** Positions only appear after you connect a wallet so we can show the loans tied to your account.

## Quick troubleshooting
- Button missing? Check the account shown in the top-right corner. If it’s not the vault owner or active lender, connect the right wallet.
- Want to preview what others see? Disconnect your wallet to browse as a guest or connect with a different account.
- Unsure whether the app picked up a recent change (for example you just funded a request)? Press **Retry indexing** so the role information refreshes.
