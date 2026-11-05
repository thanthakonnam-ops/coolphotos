const PUSH_URL = 'https://api.line.me/v2/bot/message/push'
const MAX_TEXT_LENGTH = 5000

// Sends a text message to the shop's LINE. Never throws: a failed notification
// must not fail the booking, and the shop can still see it on /admin.
export async function notifyShop(text) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const to = process.env.LINE_SHOP_USER_ID
  if (!token || !to) return

  try {
    const response = await fetch(PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        to,
        messages: [{ type: 'text', text: text.slice(0, MAX_TEXT_LENGTH) }]
      }),
      signal: AbortSignal.timeout(5000)
    })
    if (!response.ok) {
      console.error('LINE notification failed:', response.status, await response.text())
    }
  } catch (error) {
    console.error('LINE notification failed:', error)
  }
}
