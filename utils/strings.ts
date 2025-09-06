// Minimal strings module to centralize user-facing text.

export const STRINGS = {
  registerVaultWithToken: "Register vault with token",
  registerAccountWithToken: "Register your account with token",
  transferring: "Transferring…",
  topUpToVault: (amount: string, symbol: string) => `Top up ${amount} ${symbol} to vault`,
  viewTokenOnExplorer: "View token on Explorer",
  viewVaultOnExplorer: "View vault on Explorer",
  copied: "Copied",
  copy: "Copy",
  vaultRegisteredSuccess: "Vault registered with token",
  accountRegisteredSuccess: "Registration successful",
  repaySuccess: "Loan repaid successfully",
};

