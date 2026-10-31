// Booking statuses an admin may move to from each status.
// Kept separate from lib/admin.js so client components can import it.
export const STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
}
