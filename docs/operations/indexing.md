# Indexing: keeping Firestore fresh

## TL;DR
- Indexing is the “refresh” step the app runs after important actions so your dashboard matches the chain.
- You’ll see a short blocker with a **Retry indexing** button whenever the app is waiting for fresh data.
- Both vault owners and lenders benefit—owners trigger most refreshes, lenders get the up-to-date status.

## What actually happens
1. You finish something important (funding, opening a request, repaying, delegating).
2. The wallet confirms the transaction.
3. SudoStake fetches the latest vault information from NEAR.
4. The dashboard, Discover page, and lender views update instantly with the new data.

## About the blocker
- It appears only when the app knows it needs fresh data.
- You can safely wait a few seconds; it usually clears on its own.
- If it lingers, press **Retry indexing**. You’re simply asking SudoStake to fetch the vault state again.

## Common questions
- **Will I lose my place?** No. Even if you refresh the page, the blocker remembers what it was waiting for.
- **Is my transaction safe?** Yes. The chain already confirmed it. Indexing just keeps the UI in sync.
- **When should I contact support?** If retrying doesn’t clear the blocker after a minute or you suspect the wrong wallet is showing, share the transaction hash with support for a deeper check.
