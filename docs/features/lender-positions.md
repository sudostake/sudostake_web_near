# Lender positions

## TL;DR
- Positions shows vaults where your account is `accepted_offer.lender`.
- Use it to jump back into funded vaults quickly.
- Data updates in realtime by default.

## Where to find it
- `/dashboard` -> `Positions` tab.

## What you can do
- Search positions by vault ID.
- Open a vault page from the list.
- Monitor active/expired context directly on the vault screen.

## Data behavior
- Default: Firestore subscription.
- Optional polling: `NEXT_PUBLIC_LENDING_USE_API=true`.

## Notes
- If a recent repayment or claim is not reflected yet, refresh or retry indexing from vault workflows.
