// import type { VehicleAuction } from "@/lib/auction/types";

// export type BidRule = Pick<
//   VehicleAuction,
//   "startPrice" | "incrementType" | "incrementValue"
// > &
//   Partial<Pick<VehicleAuction, "currency">>;

// export function getBidCurrencyStep(currency: unknown): number | null {
//   if (currency === "UZS") return 1_000;
//   if (currency === "USD") return 1;
//   return null;
// }

// export function canonicalizeBidAmount(
//   amount: number,
//   currency: unknown,
// ): number | null {
//   const currencyStep = getBidCurrencyStep(currency);
//   if (currencyStep === null || !Number.isFinite(amount) || amount < 0) {
//     return null;
//   }

//   const stepCount = amount / currencyStep;
//   const nearestStepCount = Math.round(stepCount);
//   const tolerance =
//     Number.EPSILON * Math.max(1, Math.abs(stepCount)) * 16;
//   return Math.abs(stepCount - nearestStepCount) <= tolerance
//     ? nearestStepCount * currencyStep
//     : null;
// }

// export function getNextBid(
//   rule: BidRule,
//   highestBid?: number | null,
// ): number | null {
//   const basePrice = highestBid ?? rule.startPrice;
//   const currencyStep = getBidCurrencyStep(rule.currency);

//   if (
//     currencyStep === null ||
//     basePrice === null ||
//     !Number.isFinite(basePrice) ||
//     basePrice < 0 ||
//     rule.incrementValue === null ||
//     !Number.isFinite(rule.incrementValue) ||
//     rule.incrementValue <= 0
//   ) {
//     return null;
//   }

//   if (rule.incrementType === "FIXED") {
//     return canonicalizeBidAmount(
//       basePrice + rule.incrementValue,
//       rule.currency,
//     );
//   }

//   if (rule.incrementType === "PERCENTAGE") {
//     const rawBid = basePrice + (basePrice * rule.incrementValue) / 100;
//     const alreadyAligned = canonicalizeBidAmount(rawBid, rule.currency);
//     if (alreadyAligned !== null) return alreadyAligned;

//     // The authoritative auction rules round percentage minimums upward to the
//     // next supported currency step: USD 1 or UZS 1,000.
//     return Math.ceil(rawBid / currencyStep) * currencyStep;
//   }

//   return null;
// }


import type { VehicleAuction } from "@/lib/auction/types";

export type BidRule = Pick<
  VehicleAuction,
  "startPrice" | "incrementType" | "incrementValue"
> &
  Partial<Pick<VehicleAuction, "currency">>;

const BID_DECIMAL_PRECISION = 2;
const FLOATING_POINT_ROUNDING_TOLERANCE = 1e-9;

/**
 * Backend validates bid amounts at money precision. Keep valid decimal amounts
 * like 345.6, but round percentage tails like 2278.125 to 2278.13.
 */
export function roundBidAmount(amount: number): number | null {
  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  const factor = 10 ** BID_DECIMAL_PRECISION;
  return Math.round((amount + FLOATING_POINT_ROUNDING_TOLERANCE) * factor) / factor;
}

export function canonicalizeBidAmount(amount: number, _currency?: unknown): number | null {
  return roundBidAmount(amount);
}

/**
 * Keyingi minimal bidni hisoblaydi.
 *
 * FIXED:
 *   next = current + increment
 *
 * PERCENTAGE:
 *   next = current + (current * percent / 100)
 */
export function getNextBid(
  rule: BidRule,
  highestBid?: number | null,
): number | null {
  const basePrice = highestBid ?? rule.startPrice;

  if (
    basePrice === null ||
    !Number.isFinite(basePrice) ||
    basePrice < 0 ||
    rule.incrementValue === null ||
    !Number.isFinite(rule.incrementValue) ||
    rule.incrementValue <= 0
  ) {
    return null;
  }

  switch (rule.incrementType) {
    case "FIXED":
      return roundBidAmount(basePrice + rule.incrementValue);

    case "PERCENTAGE": {
      const rawBid = basePrice + (basePrice * rule.incrementValue) / 100;
      return roundBidAmount(rawBid);
    }

    default:
      return null;
  }
}
