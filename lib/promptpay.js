// Builds the text inside a Thai PromptPay QR code (EMVCo merchant-presented format).
// Any Thai banking app can scan it and pay the given amount to the shop's PromptPay.

function tlv(id, value) {
  return id + String(value.length).padStart(2, '0') + value
}

// CRC-16/CCITT-FALSE, required as the last field of the payload
function crc16(text) {
  let crc = 0xffff
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

// Phone (10 digits starting with 0), national/tax ID (13 digits) or e-wallet ID (15 digits)
export function isValidPromptPayId(id) {
  const digits = String(id || '').replace(/\D/g, '')
  return /^0\d{9}$/.test(digits) || /^\d{13}$/.test(digits) || /^\d{15}$/.test(digits)
}

export function promptPayPayload(id, amount) {
  const digits = String(id).replace(/\D/g, '')
  let account
  if (digits.length === 15) {
    account = tlv('03', digits)
  } else if (digits.length === 13) {
    account = tlv('02', digits)
  } else {
    // Phone numbers use the international form: 0812345678 → 0066812345678
    account = tlv('01', ('0000000000000' + digits.replace(/^0/, '66')).slice(-13))
  }

  const payload =
    tlv('00', '01') +
    tlv('01', '12') + // dynamic QR: for one payment with a fixed amount
    tlv('29', tlv('00', 'A000000677010111') + account) +
    tlv('58', 'TH') +
    tlv('53', '764') + // THB
    tlv('54', amount.toFixed(2)) +
    '6304'
  return payload + crc16(payload)
}
