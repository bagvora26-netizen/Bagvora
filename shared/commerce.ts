export function calculateOrderTotal(subtotal: number, deliveryFee: number, discount = 0) {
  return Math.max(0, Number((subtotal + deliveryFee - discount).toFixed(2)));
}

export function calculateCommission(saleAmount: number, rate: number) {
  return Number((saleAmount * (rate / 100)).toFixed(2));
}
