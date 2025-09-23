import { STRINGS } from "../../../../../utils/strings";
import { formatMinimalTokenAmount } from "../../../../../utils/format";

export function computeAcceptDisabled(
  pending: boolean,
  balLoading: boolean,
  sufficientBalance: boolean,
  lenderRegistered: boolean | null,
  vaultRegisteredForToken: boolean | null
): boolean {
  return (
    pending ||
    balLoading ||
    !sufficientBalance ||
    lenderRegistered === false ||
    vaultRegisteredForToken === false
  );
}

export function computeAcceptTitle(
  pending: boolean,
  balLoading: boolean,
  sufficientBalance: boolean,
  amountRaw: string | null | undefined,
  tokenDecimals: number,
  tokenSymbol: string,
  lenderBalanceLabel: string,
  lenderRegistered: boolean | null,
  vaultRegisteredForToken: boolean | null
): string | undefined {
  if (pending || balLoading) return undefined;
  if (!sufficientBalance && amountRaw) {
    const need = formatMinimalTokenAmount(amountRaw, tokenDecimals);
    return `Need ${need} ${tokenSymbol}, have ${lenderBalanceLabel} ${tokenSymbol}`;
  }
  if (lenderRegistered === false) return STRINGS.mustRegisterAccountBeforeAccept;
  if (vaultRegisteredForToken === false) return STRINGS.vaultMustBeRegisteredBeforeLending;
  return undefined;
}

export function computeAcceptLabel(
  pending: boolean,
  balLoading: boolean,
  lenderRegistered: boolean | null,
  vaultRegisteredForToken: boolean | null,
  sufficientBalance: boolean
): string {
  if (pending) return STRINGS.accepting;
  if (balLoading) return STRINGS.checkingBalance;
  if (lenderRegistered === false) return STRINGS.registrationRequired;
  if (vaultRegisteredForToken === false) return STRINGS.vaultNotRegisteredShort;
  if (sufficientBalance) return STRINGS.acceptRequest;
  return STRINGS.insufficientBalance;
}
