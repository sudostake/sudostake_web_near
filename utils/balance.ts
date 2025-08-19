import { formatNearAmount } from "near-api-js/lib/utils/format";

/**
 * Represents a token balance with raw minimal-unit value and methods to format it.
 * Supports conversion to human-friendly display with full or fixed precision.
 */
export class Balance {
  /**
   * @param raw Minimal-unit representation, e.g. yoctoNEAR or token minimal units.
   * @param decimals Number of fractional digits for conversion to display.
   */
  constructor(
    public raw: string,
    public decimals: number,
    /** Token symbol for display, e.g. 'NEAR' or 'USDC'. */
    public symbol: string
  ) {}

  /**
   * Human-friendly display string using the configured decimals.
   */
  toDisplay(): string {
    return formatNearAmount(this.raw, this.decimals);
  }

  /** Raw minimal-unit string. */
  get minimal(): string {
    return this.raw;
  }
}
