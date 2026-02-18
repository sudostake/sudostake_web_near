# Fund a liquidity request

## TL;DR
- Time: 3 to 5 minutes.
- Requirement: lender wallet connected, enough token balance, and storage registration if prompted.
- Result: request becomes `active` and your account is recorded as lender.

## Where funding happens
- Start in `/discover`.
- Open a request to its vault page.
- In pending state, use `Accept request`.

## Steps
1. Open a vault from Discover.
2. Review terms shown on the request card.
3. If prompted, register your wallet with the token.
4. If prompted, confirm the vault is registered with the token (owner action may be required).
5. Click `Accept request`.
6. Confirm in wallet (`ft_transfer_call`).
7. Wait for indexing.

## After funding
- Vault state changes to `active`.
- Dashboard `Positions` includes the vault for your lender account.
- Owner sees repay controls; lender sees claim/process guidance when relevant.

## Common issues
- Insufficient balance: top up token balance and retry.
- Registration missing: complete registration prompt first.
- Request already filled/canceled: refresh vault page.

## Next
- [Track lender positions](../features/lender-positions.md)
