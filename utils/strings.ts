// Minimal strings module to centralize user-facing text.

export const STRINGS = {
  // Liquidity requests header/intro
  accessUsdcTitle: "Access USDC backed by your staked tokens",
  accessUsdcCaption: "Open a request for USDC using your vault as collateral.",
  ownerRequestTitleActive: "Your request is funded",
  ownerRequestTitlePending: "Your liquidity request",
  nonOwnerRequestTitleActiveLender: "You funded this request",
  nonOwnerRequestTitleGeneric: "Vault liquidity request",
  ownerRequestCaptionPending: "You can cancel before an offer is accepted.",
  ownerRequestCaptionFunded: "This request has been funded.",
  nonOwnerRequestCaptionPending: "Review the terms and accept to lend. Your tokens will transfer to the vault via ft_transfer_call.",
  nonOwnerRequestCaptionActiveLender: "You are the lender for this active request.",
  nonOwnerRequestCaptionFunded: "This request has been funded.",
  // Common actions
  openRequest: "Open request",
  cancelRequest: "Cancel request",
  learnMore: "Learn more",
  registerVaultWithToken: "Register vault with token",
  registerAccountWithToken: "Register your account with token",
  transferring: "Transferring…",
  topUpToVault: (amount: string, symbol: string) => `Top up ${amount} ${symbol} to vault`,
  viewTokenOnExplorer: "View token on Explorer",
  viewVaultOnExplorer: "View vault on Explorer",
  copied: "Copied",
  copy: "Copy",
  copyFailed: "Copy failed",
  vaultRegisteredSuccess: "Vault registered with token",
  accountRegisteredSuccess: "Registration successful",
  vaultRegistrationRequiredTitle: "Vault registration required",
  vaultRegistrationRequiredOwnerBody: "Your vault is not registered with this token contract yet. To receive funds from a lender, register the vault with the token.",
  // Vault registration copy
  vaultRegisteredDefaultToken: "Your vault is registered with the default USDC token. You can receive USDC via ft_transfer_call.",
  vaultNotRegisteredDefaultToken: "Your vault is not registered with the default USDC token yet. You will be prompted to register during the request flow.",
  vaultNotRegisteredLendingDisabled: "This vault is not registered with this token contract yet. Lending is disabled until the vault owner registers the vault with this token.",
  repaySuccess: "Loan repaid successfully",
  // Post-expiry (lender) dialog
  loanExpired: "Loan term ended",
  loanExpiredBodyIntro: "The loan associated with vault",
  totalDue: "Total due",
  vaultCollateral: "Vault collateral",
  beginLiquidation: "Start liquidation now",
  liquidationInProgress: "Liquidation in progress",
  continueProcessing: "Continue processing claims",
  liquidationGuideNote: "You can now begin the process to claim your funds from the vault collateral. This will walk you through the steps to submit your claim.",
  close: "Close",
  processing: "Processing…",
  processClaimsSuccess: "Liquidation claim processing started",
  processAvailableNow: "Process claims for available balance",
  processNow: "Process now",
  whatHappensNext: "What happens next",
  willStartProcess: "The vault contract starts liquidation to pay your claim.",
  willContinueProcess: "The vault contract will continue liquidation to pay your claim.",
  attachesOneYocto: "This call attaches a 1 yoctoNEAR deposit and a small network fee.",
  mayTakeTime: "Parts of the process may take time (e.g., unstaking NEAR across epochs). You can close this window and return later.",
  mayTakeTimeContinuing: "Processing continues in steps (e.g., claiming matured funds). Some steps may take time across epochs.",
  trackProgressHere: "You can track progress in the 'Liquidation in progress' section on this page.",
  trackProgressHereInProgress: "Track updates in the 'Liquidation in progress' section below.",
  youCanCloseWindow: "You can safely close this window; processing will continue on-chain.",
  liquidationClosesRepay: "Starting liquidation closes the option and disables the owner's ability to repay directly.",
  willBePartial: "This will be a partial liquidation: only part of your claim is available now; the rest will be fulfilled as funds become available. You can run 'Process claims' again later.",
  willSettleNow: "Sufficient balance appears available to settle your claim now.",
  requirements: "Requirements",
  reqLenderOnly: "You must be the lender of this loan.",
  reqExpired: "The loan term must have ended, and it must not have been repaid.",
  safetyTitle: "Why this is safe",
  safetyYourKeys: "Only you can authorize this. Transactions are signed by your wallet using your private keys.",
  safetyContractChecks: "The smart contract verifies you are the lender and that the loan is eligible for liquidation.",
  safetyNoExtraFunds: "The call does not transfer your fungible tokens; it only attaches 1 yoctoNEAR and gas. Your funds remain under your control.",
  safetyCollateralBacked: "Your claim is fulfilled from the vault’s collateral and on-chain balances as defined by the contract.",
  safetyRetry: "If needed, you can safely retry later – the contract prevents unsafe or duplicate actions.",
  safetyOnChain: "Everything is recorded on-chain and can be reviewed in a block explorer.",
  // Appreciation copy for lenders
  lenderBadge: "Lender",
  lenderAppreciation: "You funded this request — thank you for supporting the ecosystem.",
  lenderLiquidationNote: "Your support is valued. We’re settling your claim from collateral as quickly as the network allows.",
  lenderGratitude: "Thank you for funding this loan — your participation powers real activity on the network.",
  liquidationInProgressIntro: "Liquidation is already in progress for vault",
  // Owner post-expiry messaging
  ownerBadge: "Vault owner",
  ownerRepayNow: "Repay now",
  ownerLoanExpiredIntro: "The loan for your vault has reached the end of its term:",
  ownerWhatYouCanDo: "What you can do",
  ownerCanRepay: "Repay the total due to avoid liquidation.",
  ownerLiquidationMayStart: "If you do not repay, the lender can begin liquidation and claim from your vault’s NEAR collateral.",
  ownerCollateralRisk: "Liquidation may progressively use your NEAR collateral until the lender’s claim is fully satisfied.",
  // Liquidation progress clarity
  waitingOnUnbondingTitle: "Unbonding status",
  waitingOnUnbondingBody: "Some collateral is currently unbonding. At the unlock epoch, the contract will claim matured funds and reduce the remaining amount owed to you by the expected amount shown below.",
  ownerWaitingOnUnbondingBody: "Some collateral is currently unbonding. At the unlock epoch, the contract will claim matured funds and reduce your remaining debt by the expected amount shown below.",
  expectedNextHint: "‘Expected next’ is what the contract can pay after claiming currently matured funds.",
  // Accept actions
  accepting: "Accepting…",
  checkingBalance: "Checking balance…",
  registrationRequired: "Registration required",
  vaultNotRegisteredShort: "Vault not registered",
  acceptRequest: "Accept request",
  insufficientBalance: "Insufficient balance",
  // Payout destination clarity
  payoutDestination: "Payout destination",
  payoutsGoTo: "Payouts are sent directly to",
  viewAccountOnExplorer: "View account on Explorer",
  availableAfterExpiry: "Available after expiry",
  // Post-term warning (owner sees ability to repay until liquidation begins)
  expiredRepayWarning: "The loan duration has ended. Repayment is still possible until liquidation is triggered.",
  // Withdraw restrictions
  withdrawDisabledLiquidation: "Withdraw is disabled while liquidation is in progress.",
  withdrawDisabledActive: "Withdraw is disabled while a loan is active.",
  withdrawDisabledPending: "Withdraw is disabled while a liquidity request is open.",
  // Delegate restrictions
  delegateDisabledLiquidation: "Delegation is disabled while liquidation is in progress.",
  delegateDisabledRefunds: "Delegation is disabled while there are pending refund entries.",
  claimDisabledLiquidation: "Claim is disabled while liquidation is in progress.",
  undelegateDisabledLiquidation: "Undelegation is disabled while liquidation is in progress.",
  undelegateDisabledPending: "Undelegation is disabled while a liquidity request is open.",
  pendingRefunds: "Pending refunds",
  refundsAffectDelegation: "Delegation is temporarily unavailable until refunds are resolved.",
  // Simplified liquidation summary
  gettingYourMoney: "We’re getting your money back",
  paidSoFar: "Paid so far",
  paidShort: "Paid",
  expectedNext: "Expected next",
  availableNow: "Available now",
  nowShort: "Now",
  nextShort: "Next",
  nothingAvailableNow: "Nothing to claim right now",
  claimBecomesAvailable: "Claim will be available once funds mature.",
  waitingToUnlock: "Unlocking summary",
  showDetails: "Show details",
  hideDetails: "Hide details",
  nextPayoutSources: "Next payout",
  sourceVaultBalanceNow: "Vault balance (available now)",
  sourceMaturedUnbonding: "Matured (claimable now)",
  maturedClaimableNow: "Matured (claimable now)",
  noMaturedYet: "No matured entries yet",
  // Current request panel
  currentRequestTitle: "Current request",
  tokenLabel: "Token",
  amountLabel: "Amount",
  interestLabel: "Interest",
  collateralLabel: "Collateral",
  durationLabel: "Duration",
  yourBalance: "Your balance",
  contractBalanceLabel: "Contract balance",
  usdcBalanceLabel: "USDC balance",
  ownerLabel: "Owner",
  vaultIdLabel: "Vault ID",
  // Accept gating messages
  mustRegisterAccountBeforeAccept: "You must register with this token contract before accepting",
  vaultMustBeRegisteredBeforeLending: "Vault must be registered with the token contract before lending can proceed",
  // Epoch / ETA labels
  unlockEpochLabel: "Unlock epoch",
  remainingLabel: "Remaining",
  etaLabel: "ETA",
  availableNowLabel: "Available now",
  // Note: dynamic strings should be implemented as functions outside STRINGS
  // Liquidation card: role-specific headings/notes
  ownerLiquidationHeader: "Collateral payout",
  ownerLiquidationNote: "Liquidation is in progress to satisfy the lender’s claim using your vault’s NEAR.",
  unbondingFootnoteLender: "Unbonding completes when the unlock epoch is reached. These amounts will become available to reduce the remaining amount owed to you as soon as they mature. The contract will claim matured amounts during the liquidation flow. Epoch timing is network-defined and approximate.",
  unbondingFootnoteOwner: "Unbonding completes when the unlock epoch is reached. These amounts will become available to reduce your remaining debt as soon as they mature. The contract will claim matured amounts during the liquidation flow. Epoch timing is network-defined and approximate.",
  // Delegations summary
  delegationsSummaryTitle: "Delegations Summary",
  totalStaked: "Total staked",
  totalUnstaked: "Total unstaked",
  stakedLabelUI: "Staked",
  unstakedLabelUI: "Unstaked",
  validatorLabel: "Validator",
  statusWithdrawable: "Ready to withdraw",
  statusUnstaking: "Unstaking",
  statusActive: "Active",
  claimAction: "Claim",
  delegateAction: "Delegate",
  undelegateAction: "Undelegate",
  // Generic labels
  availableBalanceTitle: "Available balance",
  back: "Back",
  depositAction: "Deposit",
  withdrawAction: "Withdraw",
  transferAction: "Transfer",
  expiredLabel: "Expired",
};

/**
 * Returns the "Includes X NEAR matured" string.
 */
export function includesMaturedString(amount: string): string {
  return `Includes ${amount} NEAR matured`;
}

export function storageDepositString(amount: string): string {
  return `This is a one-time storage deposit of ${amount} NEAR.`;
}

export function fundedByString(accountId: string): string {
  return `Funded by ${accountId}`;
}

export function startLiquidationInString(countdown: string): string {
  return `Start liquidation in ${countdown}`;
}
