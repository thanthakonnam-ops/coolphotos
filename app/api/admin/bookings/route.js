import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminUser, STATUS_TRANSITIONS } from '@/lib/admin'

// PATCH /api/admin/bookings - Change a booking's status (admin only)
// Body: { id, status }
export async function PATCH(request) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json(
        { error: 'เฉพาะผู้ดูแลระบบเท่านั้น' },
        { status: 403 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 })
    }
    const { id, status } = body || {}

    if (typeof id !== 'string' || typeof status !== 'string') {
      return NextResponse.json(
        { error: 'กรุณาระบุรหัสการจองและสถานะใหม่' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) {
      return NextResponse.json({ error: 'ไม่พบรายการจองนี้' }, { status: 404 })
    }

    const allowed = STATUS_TRANSITIONS[booking.status] || []
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `ไม่สามารถเปลี่ยนสถานะจาก ${booking.status} เป็น ${status} ได้` },
        { status: 409 }
      )
    }

    // Only update if the status hasn't been changed by someone else meanwhile
    const { count } = await prisma.booking.updateMany({
      where: { id, status: booking.status },
      data: { status }
    })
    if (count === 0) {
      return NextResponse.json(
        { error: 'สถานะของรายการนี้ถูกเปลี่ยนไปแล้ว กรุณารีเฟรชหน้า' },
        { status: 409 }
      )
    }

    return NextResponse.json({ id, status })
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' },
      { status: 500 }
    )
  }
}
