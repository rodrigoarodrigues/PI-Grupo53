export interface PriceCalculationParams {
  rentalType: "unitario" | "assinatura";
  basePrice: number;
  days: number;
  subscriptionMonthlyPrice?: number;
}

export function calculateRentalPrice(params: PriceCalculationParams): number {
  const { rentalType, basePrice, days, subscriptionMonthlyPrice = 50.0 } = params;

  if (rentalType === "assinatura") {
    return subscriptionMonthlyPrice;
  }

  let totalPrice = basePrice * days;

  if (days >= 30) {
    totalPrice *= 0.7;
  } else if (days >= 14) {
    totalPrice *= 0.85;
  } else if (days >= 7) {
    totalPrice *= 0.9;
  }

  return Math.round(totalPrice * 100) / 100;
}

export function calculateFine(
  daysOverdue: number,
  basePrice: number,
  fineRate: number = 0.1
): number {
  if (daysOverdue <= 0) {
    return 0;
  }

  const dailyFine = basePrice * fineRate;
  const totalFine = dailyFine * daysOverdue;

  const maxFine = basePrice * 3;
  return Math.min(Math.round(totalFine * 100) / 100, maxFine);
}

