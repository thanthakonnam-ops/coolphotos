// Shared by the checkout page and the bookings API so the price shown to the
// customer is calculated exactly the same way as the price that gets saved.

export const DEPOSIT_RATE = 0.3

// Most units of one item a customer can book at once
export const MAX_QUANTITY = 10

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Today's date as YYYY-MM-DD in Thai time (server may run in UTC)
export function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' })
}

// Returning on the same day (or no return date) counts as 1 day
export function rentalDays(startDate, endDate) {
  if (!startDate || !endDate || endDate <= startDate) return 1
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86400000)
}

// Gear is charged per day; photographers and packages are a fixed price per unit
export function priceLine(unitPrice, quantity, days, perDay) {
  const total = unitPrice * quantity * (perDay ? days : 1)
  return { total, deposit: Math.round(total * DEPOSIT_RATE) }
}
