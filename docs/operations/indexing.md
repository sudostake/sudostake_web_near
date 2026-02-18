# Indexing and consistency

## TL;DR
- Indexing keeps Firestore vault documents aligned with on-chain vault state.
- Most important actions trigger indexing automatically.
- If indexing fails, the app blocks with a `Retry indexing` modal until it succeeds.

## When indexing runs
- After creating a vault.
- After opening/canceling/accepting a request.
- After repayment and claim processing.
- During manual retry flows.

## What indexing does
1. Reads fresh vault state from chain.
2. Transforms state to the app document shape.
3. Writes back to Firestore for realtime subscribers.

## Route behavior
- `/api/index_vault` performs immediate indexing and returns success/failure.
- `/api/indexing/enqueue` stores a background job for worker recovery.
- `/api/indexing/worker` processes queued jobs with retry backoff.

## Symptoms of stale data
- Request state does not change after a confirmed transaction.
- Lender/owner action buttons do not match expected role.
- Discover and vault page show different state briefly.

## Recovery steps
1. Wait a few seconds after wallet confirmation.
2. Use retry indexing where available.
3. Refresh the page.
4. If still stale, escalate with transaction hash.
