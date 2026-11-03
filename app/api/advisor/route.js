import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  loadCatalog,
  ruleBasedAdvice,
  geminiAdvice,
  withDetails,
  readRequest,
  MAX_MESSAGE_LENGTH
} from '@/lib/advisor'

// Simple per-IP limit so the AI key can't be drained by one visitor
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 10
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json({ error: 'กรุณาพิมพ์สิ่งที่อยากถ่ายหรืองบประมาณ' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `ข้อความยาวเกิน ${MAX_MESSAGE_LENGTH} ตัวอักษร` }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'ถามถี่เกินไป กรุณารอสักครู่แล้วลองใหม่' }, { status: 429 })
  }

  const history = Array.isArray(body?.history)
    ? body.history.filter((m) => m && typeof m.text === 'string' && ['user', 'assistant'].includes(m.role))
    : []

  try {
    const catalog = await loadCatalog(prisma)
    const days = readRequest(message).days
    const apiKey = process.env.GEMINI_API_KEY

    let result
    let mode = 'rules'
    if (apiKey) {
      try {
        result = await geminiAdvice(message, catalog, {
          apiKey,
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          history
        })
        mode = 'ai'
      } catch (e) {
        console.error('Advisor: Gemini failed, using rules instead:', e.message)
      }
    }
    if (!result) result = ruleBasedAdvice(message, catalog)

    return NextResponse.json({
      mode,
      reply: result.reply,
      request: result.request,
      recommendations: withDetails(result.recommendations, catalog, days)
    })
  } catch (e) {
    console.error('Advisor error:', e)
    return NextResponse.json({ error: 'ระบบแนะนำขัดข้อง กรุณาลองใหม่อีกครั้ง' }, { status: 500 })
  }
}
