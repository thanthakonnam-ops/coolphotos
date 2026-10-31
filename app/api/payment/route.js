import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import QRCode from 'qrcode'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { isValidPromptPayId, promptPayPayload } from '@/lib/promptpay'

// GET /api/payment?ref=CPXXXXXX - PromptPay QR for the unpaid bookings of one order.
// The amount is always calculated here from the database.
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อน' }, { status: 401 })
    }

    const ref = new URL(request.url).searchParams.get('ref')
    if (!ref) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสคำสั่งจอง' }, { status: 400 })
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id, orderRef: ref, status: 'PENDING' }
    })
    if (bookings.length === 0) {
      return NextResponse.json(
        { error: 'ไม่พบรายการที่รอชำระเงินในคำสั่งจองนี้' },
        { status: 404 }
      )
    }

    const promptPayId = process.env.PROMPTPAY_ID
    if (!isValidPromptPayId(promptPayId)) {
      console.error('PROMPTPAY_ID is missing or invalid in .env')
      return NextResponse.json(
        { error: 'ร้านยังไม่ได้ตั้งค่าบัญชีพร้อมเพย์ ทีมงานจะติดต่อกลับเพื่อแจ้งช่องทางชำระเงิน' },
        { status: 503 }
      )
    }

    const amount = bookings.reduce((sum, b) => sum + b.totalPrice + b.deposit, 0)
    const qr = await QRCode.toDataURL(promptPayPayload(promptPayId, amount), {
      margin: 1,
      width: 320
    })

    return NextResponse.json({
      ref,
      amount,
      qr,
      accountName: process.env.PROMPTPAY_NAME || ''
    })
  } catch (error) {
    console.error('Error creating payment QR:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้าง QR ชำระเงิน' },
      { status: 500 }
    )
  }
}
