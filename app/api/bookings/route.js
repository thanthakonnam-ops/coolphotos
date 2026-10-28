import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/bookings - Return bookings for authenticated user, ordered by createdAt desc
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนดูรายการจอง' },
        { status: 401 }
      )
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create booking and clear user's cart
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนทำการจอง' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const userId = session.user.id

    // Support both array of items and single booking item
    let rawItems = []
    if (Array.isArray(body.items) && body.items.length > 0) {
      rawItems = body.items
    } else if (body.itemName && body.totalPrice !== undefined) {
      rawItems = [body]
    } else {
      return NextResponse.json(
        { error: 'กรุณาระบุข้อมูลรายการที่ต้องการจอง' },
        { status: 400 }
      )
    }

    const todayStr = new Date().toISOString().split('T')[0]

    // Create bookings in a transaction
    const createdBookings = await prisma.$transaction(
      rawItems.map((item) =>
        prisma.booking.create({
          data: {
            userId,
            itemType: item.itemType || 'GEAR',
            itemName: item.itemName,
            startDate: item.startDate || todayStr,
            endDate: item.endDate || null,
            totalPrice: parseInt(item.totalPrice, 10),
            status: item.status || 'PENDING'
          }
        })
      )
    )

    // Clear user's cart after successful booking
    await prisma.cartItem.deleteMany({
      where: { userId }
    })

    return NextResponse.json(
      {
        message: 'ทำการจองสำเร็จเรียบร้อยแล้ว',
        bookings: createdBookings
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างรายการจอง' },
      { status: 500 }
    )
  }
}
