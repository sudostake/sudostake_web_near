# Architecture overview

## TL;DR
- NEAR is source of truth for vault state.
- Firestore mirrors vault state for fast UI reads.
- Next.js API routes bridge RPC calls and indexing writes.

## Main pieces
- Frontend (Next.js app): dashboard, Discover, vault pages, docs.
- Wallet layer: NEAR Wallet Selector for sign-in and transaction approval.
- Data mirror: Firestore documents keyed by factory and vault IDs.
- Server routes: `/api/rpc` and indexing/data endpoints.

## Runtime flow
1. User opens app and optionally connects wallet.
2. UI reads indexed vault/request data from Firestore (or route fallback).
3. User approves a transaction in wallet.
4. App indexes fresh vault state from chain.
5. Firestore subscribers update Discover/dashboard/vault views.

## Why this model
- Fast list/detail rendering from indexed documents.
- Clear wallet approval boundary for state-changing actions.
- Deterministic recovery path through retry indexing.

## Related docs
- [Playbook](./playbook.md)
- [Data model](./reference/data-model.md)
- [Indexing](./operations/indexing.md)
