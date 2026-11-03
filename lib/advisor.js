// Shopping assistant for beginners: "ถ่ายรับปริญญา งบ 3,000" -> picks from the catalog.
// Two engines share one output shape:
//   - Gemini (when GEMINI_API_KEY is set): reads the catalog and the customer's message
//   - Rules (always available, and the fallback if Gemini fails): keyword + budget matching
// Either way, every recommended id is checked against the database catalog,
// so the assistant can never invent a product or a price.

import { DEPOSIT_RATE } from './pricing'

const PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80'

export const MAX_MESSAGE_LENGTH = 500

// ---------- catalog ----------

export async function loadCatalog(prisma) {
  const [gear, photographers, packages] = await Promise.all([
    prisma.gear.findMany({ orderBy: { pricePerDay: 'asc' } }),
    prisma.photographer.findMany({ orderBy: { rating: 'desc' } }),
    prisma.package.findMany({ orderBy: { price: 'asc' } })
  ])

  return [
    ...gear.map((g) => ({
      type: 'gear',
      id: g.id,
      name: g.name,
      price: g.pricePerDay,
      unit: 'วัน',
      perDay: true,
      available: g.status === 'AVAILABLE',
      details: [g.category, g.description].filter(Boolean).join(' — '),
      image: g.image,
      href: '/gear',
      category: g.category
    })),
    ...photographers.map((p) => ({
      type: 'photographer',
      id: p.id,
      name: `ช่างภาพ: ${p.name}`,
      price: p.pricePerHalf,
      unit: 'ครึ่งวัน (4 ชม.)',
      perDay: false,
      available: true,
      details: `ถนัด: ${p.specialty} · ★ ${p.rating} (${p.reviewCount} รีวิว) · ${p.bio || ''}`,
      specialty: p.specialty,
      image: p.avatar,
      href: `/photographers/${p.id}`,
      category: p.specialty
    })),
    ...packages.map((k) => ({
      type: 'package',
      id: k.id,
      name: `แพ็กเกจ ${k.name}`,
      price: k.price,
      unit: 'แพ็กเกจ',
      perDay: false,
      available: true,
      details: `${k.description} · รวม: ${k.includes}`,
      image: PACKAGE_IMAGE,
      href: '/#packages',
      category: ''
    }))
  ]
}

// ---------- reading the customer's message ----------

const OCCASIONS = [
  {
    key: 'graduation',
    label: 'ถ่ายรับปริญญา',
    words: ['รับปริญญา', 'ปริญญา', 'บัณฑิต', 'จบการศึกษา', 'ซ้อมใหญ่', 'graduation'],
    match: ['รับปริญญา', 'พอร์ตเทรต'],
    wantsPro: true
  },
  {
    key: 'wedding',
    label: 'งานแต่งงาน / พรีเวดดิ้ง',
    words: ['แต่งงาน', 'งานแต่ง', 'พรีเวด', 'หมั้น', 'wedding'],
    match: ['แต่งงาน', 'พรีเวดดิ้ง', 'หมั้น', 'อีเวนต์'],
    wantsPro: true
  },
  {
    key: 'event',
    label: 'งานอีเวนต์',
    words: ['อีเวนต์', 'event', 'คอนเสิร์ต', 'งานเลี้ยง', 'สัมมนา', 'ปาร์ตี้', 'วันเกิด', 'งานบริษัท', 'กีฬาสี'],
    match: ['อีเวนต์', 'คอนเสิร์ต'],
    wantsPro: true
  },
  {
    key: 'product',
    label: 'ถ่ายสินค้า / อาหาร',
    words: ['สินค้า', 'อาหาร', 'ขายของ', 'ร้าน', 'โฆษณา', 'แบรนด์', 'เมนู', 'product'],
    match: ['สินค้า', 'อาหาร', 'โฆษณา', 'รีวิว'],
    wantsPro: true
  },
  {
    key: 'portrait',
    label: 'ถ่ายโปรไฟล์ / พอร์ตเทรต',
    words: ['โปรไฟล์', 'พอร์ตเทรต', 'portrait', 'profile', 'แฟชั่น', 'รูปสมัครงาน', 'ถ่ายรูปตัวเอง'],
    match: ['พอร์ตเทรต', 'แฟชั่น', 'โปรไฟล์'],
    wantsPro: true
  },
  {
    key: 'content',
    label: 'ทำคอนเทนต์ / ถ่ายเที่ยว',
    words: ['เที่ยว', 'ทริป', 'vlog', 'คอนเทนต์', 'tiktok', 'reels', 'youtube', 'ยูทูบ', 'โซเชียล', 'คลิป'],
    match: ['คอนเทนต์', 'โซเชียล', 'วิดีโอ', 'รีวิว'],
    wantsPro: false
  }
]

const DIY_WORDS = ['ถ่ายเอง', 'เช่ากล้อง', 'ยืมกล้อง', 'อยากได้กล้อง', 'หากล้อง', 'กล้องอะไร', 'กล้องตัวไหน']
const PRO_WORDS = ['ช่างภาพ', 'จ้าง', 'คนถ่าย', 'ตากล้อง', 'มืออาชีพ']

function toNumber(raw, unitWord) {
  let n = parseFloat(String(raw).replace(/,/g, ''))
  if (Number.isNaN(n)) return null
  if (/^(k|K|พัน)/.test(unitWord || '')) n *= 1000
  if (/^หมื่น/.test(unitWord || '')) n *= 10000
  return Math.round(n)
}

// "งบ 3,000" / "งบ3k" / "ไม่เกิน 1.5 หมื่น" / "5000 บาท"
export function parseBudget(text) {
  const near = text.match(/(?:งบ(?:ประมาณ)?|ไม่เกิน|ราคา|budget)\s*:?\s*([\d.,]+)\s*(k|K|พัน|หมื่น)?/)
  if (near) return toNumber(near[1], near[2])
  const baht = text.match(/([\d.,]+)\s*(k|K|พัน|หมื่น)?\s*(?:บาท|฿)/)
  if (baht) return toNumber(baht[1], baht[2])
  // A bare number that isn't a count of days, hours, people or photos
  const nums = [...text.matchAll(/([\d.,]+)\s*(k|K|พัน|หมื่น)?(?!\s*(?:วัน|ชั่วโมง|ชม|คน|รูป|ภาพ|ตัว|นาที))/g)]
    .map((m) => toNumber(m[1], m[2]))
    .filter((n) => n && n >= 200)
  return nums.length ? Math.max(...nums) : null
}

export function parseDays(text) {
  const m = text.match(/(\d+)\s*วัน/)
  const days = m ? parseInt(m[1], 10) : 1
  return Math.min(Math.max(days, 1), 30)
}

export function readRequest(text) {
  const lower = text.toLowerCase()
  const occasion = OCCASIONS.find((o) => o.words.some((w) => lower.includes(w.toLowerCase()))) || null
  const wantsDiy = DIY_WORDS.some((w) => lower.includes(w))
  const wantsPro = PRO_WORDS.some((w) => lower.includes(w))
  return {
    budget: parseBudget(text),
    days: parseDays(text),
    occasion,
    style: wantsDiy && !wantsPro ? 'diy' : wantsPro && !wantsDiy ? 'pro' : 'any'
  }
}

// ---------- rules engine ----------

const baht = (n) => `${Number(n).toLocaleString('th-TH')} บาท`

function costOf(item, days) {
  return item.perDay ? item.price * days : item.price
}

function occasionScore(item, occasion) {
  if (!occasion) return 0
  const text = `${item.details} ${item.specialty || ''}`.toLowerCase()
  return occasion.match.filter((w) => text.includes(w.toLowerCase())).length
}

export function ruleBasedAdvice(message, catalog) {
  const req = readRequest(message)
  const { budget, days, occasion, style } = req
  const items = catalog.filter((i) => i.available)
  const fits = (i) => budget == null || costOf(i, days) <= budget

  const rank = (list) =>
    [...list].sort(
      (a, b) =>
        occasionScore(b, occasion) - occasionScore(a, occasion) ||
        Number(fits(b)) - Number(fits(a)) ||
        costOf(a, days) - costOf(b, days)
    )

  const pro = rank(items.filter((i) => i.type !== 'gear'))
  const gear = rank(items.filter((i) => i.type === 'gear'))
  // Cameras: for the same occasion, the best camera that fits the budget
  const bestGear = [...gear].filter(fits).sort((a, b) => b.price - a.price)[0] || gear[0]

  const picks = []
  const add = (item, reason) => {
    if (item && !picks.some((p) => p.id === item.id)) picks.push({ id: item.id, type: item.type, reason })
  }

  const proFits = pro.filter(fits)
  const bestPro = proFits[0]
  const matchedOver = pro.find((i) => !fits(i) && occasionScore(i, occasion) > 0)

  const reasonFor = (item) => {
    const cost = costOf(item, days)
    const parts = []
    if (occasion && occasionScore(item, occasion) > 0) parts.push(`เหมาะกับ${occasion.label}`)
    if (item.type === 'package') parts.push('ได้ทั้งช่างภาพและการแต่งภาพในราคาเดียว ไม่ต้องมีความรู้เรื่องกล้อง')
    if (item.type === 'photographer') parts.push('มีช่างภาพมืออาชีพถ่ายและแนะนำท่าโพสให้')
    if (item.type === 'gear') parts.push(`เช่าไปถ่ายเองได้ ${days} วัน ใช้ง่ายสำหรับมือใหม่`)
    if (budget != null) {
      parts.push(cost <= budget ? `ค่าบริการ ${baht(cost)} อยู่ในงบ` : `ค่าบริการ ${baht(cost)} เกินงบ ${baht(cost - budget)}`)
    } else {
      parts.push(`ค่าบริการ ${baht(cost)}`)
    }
    return parts.join(' · ')
  }

  if (style !== 'diy') {
    add(bestPro, bestPro && reasonFor(bestPro))
    // A better-matched option just over budget is still worth showing
    if (matchedOver && (!bestPro || occasionScore(matchedOver, occasion) > occasionScore(bestPro, occasion))) {
      add(matchedOver, reasonFor(matchedOver))
    }
    if (!bestPro && pro[0]) add(pro[0], reasonFor(pro[0]))
  }
  if (style !== 'pro' || picks.length === 0) add(bestGear, bestGear && reasonFor(bestGear))
  if (style === 'diy') {
    const second = gear.filter(fits).find((g) => g.id !== bestGear?.id)
    add(second, second && reasonFor(second))
  }
  if (picks.length < 2 && proFits[1]) add(proFits[1], reasonFor(proFits[1]))

  const top = picks.slice(0, 3)
  const lines = []
  lines.push(
    occasion
      ? `สำหรับ${occasion.label}${budget != null ? ` งบ ${baht(budget)}` : ''} ผมแนะนำแบบนี้ครับ`
      : `ผมยังไม่แน่ใจว่าจะถ่ายงานแบบไหน${budget != null ? ` แต่สำหรับงบ ${baht(budget)}` : ''} ลองดูตัวเลือกนี้ก่อนครับ`
  )
  const first = catalog.find((c) => c.id === top[0]?.id)
  if (first && first.type !== 'gear') {
    lines.push('ถ้าไม่ถนัดใช้กล้อง เลือกแบบมีช่างภาพจะได้ภาพสวยแน่นอนที่สุด')
  }
  if (budget != null && top.length && top.every((p) => costOf(catalog.find((c) => c.id === p.id), days) > budget)) {
    lines.push('ตอนนี้ยังไม่มีตัวเลือกที่อยู่ในงบพอดี รายการด้านล่างคือที่ใกล้งบที่สุด')
  }
  lines.push(`ตอนจองจะมีมัดจำเพิ่ม ${Math.round(DEPOSIT_RATE * 100)}% ซึ่งได้คืนเต็มจำนวนหลังจบงาน`)
  if (!occasion) lines.push('บอกผมเพิ่มได้นะครับ เช่น "ถ่ายรับปริญญา" "ถ่ายสินค้าขายออนไลน์" หรือ "เช่ากล้องไปเที่ยว 2 วัน"')

  return { reply: lines.join(' '), recommendations: top, request: summarize(req) }
}

function summarize({ budget, days, occasion, style }) {
  return { budget, days, occasion: occasion?.label || null, style }
}

// ---------- Gemini engine ----------

export const SYSTEM_PROMPT = `คุณคือ "ผู้ช่วยเลือก" ของร้าน Cool Photos บริการเช่ากล้องและจองช่างภาพในประเทศไทย
ลูกค้าส่วนใหญ่เป็นมือใหม่ที่ไม่มีความรู้เรื่องกล้อง หน้าที่ของคุณคือแนะนำสินค้า 1-3 รายการจาก CATALOG ที่ให้มาเท่านั้น

กฎ:
1. แนะนำเฉพาะรายการที่อยู่ใน CATALOG และ available เป็น true ห้ามแต่งชื่อ ราคา หรือสเปกที่ไม่มีในข้อมูล
2. อ่านประเภทงาน งบประมาณ และจำนวนวันจากข้อความลูกค้า อุปกรณ์คิดราคา price x จำนวนวัน ช่างภาพและแพ็กเกจคิดราคาเดียว
3. ให้ความสำคัญกับรายการที่อยู่ในงบก่อน ถ้าไม่มีให้แนะนำที่ใกล้งบที่สุดและบอกตรง ๆ ว่าเกินงบเท่าไร
4. ลูกค้าที่ไม่ถนัดกล้องและงานสำคัญ (รับปริญญา งานแต่ง อีเวนต์) ควรได้ตัวเลือกที่มีช่างภาพก่อน ถ้าลูกค้าอยากถ่ายเอง ให้แนะนำกล้อง
5. ใช้ภาษาไทยที่สุภาพ เป็นกันเอง ไม่ใช้ศัพท์เทคนิค ตอบสั้น (reply ไม่เกิน 3 ประโยค) และบอกว่าตอนจองมีมัดจำ 30% ที่ได้คืน
6. ถ้าคำถามไม่เกี่ยวกับการถ่ายภาพหรือร้าน ให้ตอบสั้น ๆ ว่าช่วยได้เฉพาะเรื่องเลือกกล้องและช่างภาพ และไม่ต้องแนะนำสินค้า

ตอบเป็น JSON เท่านั้น ตามรูปแบบ:
{"reply": "ข้อความถึงลูกค้า", "recommendations": [{"id": "id จาก CATALOG", "reason": "เหตุผลสั้น ๆ 1 ประโยค ระบุราคาและว่าอยู่ในงบไหม"}]}`

export function catalogForPrompt(catalog) {
  return catalog.map(({ id, type, name, price, unit, available, details }) => ({
    id,
    type,
    name,
    price,
    unit,
    available,
    details
  }))
}

export async function geminiAdvice(message, catalog, { apiKey, model, history = [] }) {
  const contents = [
    ...history.slice(-6).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.text).slice(0, MAX_MESSAGE_LENGTH) }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ]

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${SYSTEM_PROMPT}\n\nCATALOG:\n${JSON.stringify(catalogForPrompt(catalog))}` }]
        },
        contents,
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json', maxOutputTokens: 800 }
      }),
      signal: AbortSignal.timeout(15000)
    }
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || ''
  const parsed = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ''))
  if (typeof parsed?.reply !== 'string') throw new Error('Gemini returned no reply')

  // Keep only real, available items
  const byId = new Map(catalog.map((c) => [c.id, c]))
  const recommendations = (Array.isArray(parsed.recommendations) ? parsed.recommendations : [])
    .filter((r) => byId.get(r?.id)?.available)
    .slice(0, 3)
    .map((r) => ({ id: r.id, type: byId.get(r.id).type, reason: String(r.reason || '').slice(0, 300) }))

  return { reply: parsed.reply.slice(0, 1000), recommendations, request: summarize(readRequest(message)) }
}

// Adds the display fields (name, price, image, link) the page needs to each pick
export function withDetails(recommendations, catalog, days) {
  const byId = new Map(catalog.map((c) => [c.id, c]))
  return recommendations
    .map((r) => {
      const item = byId.get(r.id)
      if (!item) return null
      return {
        id: item.id,
        type: item.type,
        name: item.name,
        price: item.price,
        unit: item.unit,
        total: costOf(item, days),
        image: item.image,
        href: item.href,
        category: item.category,
        reason: r.reason
      }
    })
    .filter(Boolean)
}
