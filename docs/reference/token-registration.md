# Token registration (NEP-141)

NEP-141 tokens on NEAR require accounts to deposit a small amount of NEAR to cover on-chain storage for balances and allowances. This process is often called “registration.”

Why it matters

- Without registration, a token contract may reject transfers to or from the account.
- Both receivers (e.g., a vault that receives USDC via ft_transfer_call) and senders (e.g., a lender holding USDC) typically need to register.

How it works

1) Read the minimum storage cost using storage_balance_bounds on the token contract.
2) Call storage_deposit with at least the minimum deposit, specifying the account to register.
3) After registration, the token contract can store balance/allowance data for that account.

Costs and refunds

- The deposit is held by the token contract to pay for storage. Some contracts allow refunds via storage_unregister if your balance and allowances are cleared.

UI support

- The app checks registration and offers a one-click “Register … with token” button when required for both the vault owner and the lender.
- You can also view the token contract on the NEAR Explorer from the same UI.

