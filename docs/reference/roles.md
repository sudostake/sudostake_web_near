# Viewer roles

## Role types
- `guest`: wallet not connected.
- `owner`: connected account equals vault owner.
- `activeLender`: connected account equals accepted offer lender.
- `potentialLender`: connected account is neither owner nor active lender.

## What each role can do

| Role | Pending request | Active loan | Owner tools |
| --- | --- | --- | --- |
| guest | Read-only | Read-only | No |
| owner | Open/cancel request | Repay, start liquidation/claims flow | Yes |
| activeLender | View funded request | Process claims access when available | No |
| potentialLender | Accept request (if eligible) | Read-only | No |

## Notes
- Actions are also gated by vault state and registration checks.
- Time-based actions are gated by loan expiry and liquidation status.
- If expected actions are missing, verify connected account and refresh indexed state.
