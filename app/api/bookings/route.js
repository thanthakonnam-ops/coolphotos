import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DATE_RE, MAX_QUANTITY, todayStr, rentalDays, priceLine } from '@/lib/pricing'
import { ITEM_TYPES, findItem } from '@/lib/catalog'

const PAYMENT_METHODS = ['promptpay']
const MAX_ITEMS = 20

// Thrown for problems the customer can fix; message is shown to them as-is
class BookingError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

// Gear and photographers can only be booked once for overlapping dates
async function findClash(tx, itemType, itemId, startDate, endDate) {
  return tx.booking.findFirst({
    where: {
      itemType,
      itemId,
      status: { not: 'CANCELLED' },
      startDate: { lte: endDate },
      OR: [
        { endDate: { gte: startDate } },
        { endDate: null, startDate: { gte: startDate } }
      ]
    }
  })
}

// GET /api/bookings - Return bookings for authenticated user, ordered by createdAt desc
export async function GET() {
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

// POST /api/bookings - Create bookings from the cart and clear user's cart
// Body: { items: [{ itemType, itemId, quantity }], startDate, endDate, contact, paymentMethod }
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนทำการจอง' },
        { status: 401 }
      )
    }
    const userId = session.user.id

    let body
    try {
      body = await request.json()
    } catch {
      throw new BookingError('รูปแบบข้อมูลไม่ถูกต้อง')
    }

    const { items, startDate, paymentMethod } = body || {}
    const endDate = body?.endDate || null
    const contact = body?.contact || {}

    if (!Array.isArray(items) || items.length === 0) {
      throw new BookingError('กรุณาระบุข้อมูลรายการที่ต้องการจอง')
    }
    if (items.length > MAX_ITEMS) {
      throw new BookingError(`จองได้สูงสุด ${MAX_ITEMS} รายการต่อครั้ง`)
    }
    if (typeof startDate !== 'string' || !DATE_RE.test(startDate)) {
      throw new BookingError('กรุณาเลือกวันที่เริ่มต้นเช่า / นัดหมาย')
    }
    if (startDate < todayStr()) {
      throw new BookingError('ไม่สามารถจองย้อนหลังได้ กรุณาเลือกวันที่ตั้งแต่วันนี้เป็นต้นไป')
    }
    if (endDate !== null && (typeof endDate !== 'string' || !DATE_RE.test(endDate) || endDate < startDate)) {
      throw new BookingError('วันที่ส่งคืนต้องไม่ก่อนวันที่เริ่มต้นเช่า')
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      throw new BookingError('กรุณาเลือกช่องทางชำระเงิน')
    }

    const contactName = cleanText(contact.name, 100)
    const contactPhone = cleanText(contact.phone, 30)
    const address = cleanText(contact.address, 500)
    if (!contactName || !contactPhone) {
      throw new BookingError('กรุณากรอกชื่อ-นามสกุล และเบอร์โทรศัพท์สำหรับติดต่อ')
    }
    if (!address) {
      throw new BookingError('กรุณากรอกที่อยู่สำหรับการจัดส่งอุปกรณ์หรือนัดหมายสถานที่')
    }
    const contactFields = {
      contactName,
      contactPhone,
      contactEmail: cleanText(contact.email, 200),
      address,
      notes: cleanText(contact.notes, 500),
      paymentMethod
    }

    const days = rentalDays(startDate, endDate)
    // Short code like CP3F9A1C — easy to read out or type into a bank transfer note
    const orderRef = 'CP' + randomBytes(3).toString('hex').toUpperCase()

    const createdBookings = await prisma.$transaction(async (tx) => {
      const created = []
      for (const item of items) {
        const itemType = ITEM_TYPES[item?.itemType]
        const itemId = typeof item?.itemId === 'string' ? item.itemId : ''
        const quantity = Number(item?.quantity)
        if (!itemType || !itemId) {
          throw new BookingError('ข้อมูลรายการในตะกร้าไม่ถูกต้อง กรุณาลบออกแล้วเลือกใหม่')
        }
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
          throw new BookingError(`จำนวนต้องอยู่ระหว่าง 1-${MAX_QUANTITY} ต่อรายการ`)
        }

        const found = await findItem(tx, itemType, itemId)
        if (!found) {
          throw new BookingError('มีบางรายการในตะกร้าที่ไม่มีให้บริการแล้ว กรุณาลบออกแล้วเลือกใหม่')
        }
        if (!found.available) {
          throw new BookingError(`"${found.name}" ติดคิวอยู่ในขณะนี้`, 409)
        }

        const isGear = itemType === 'GEAR'
        // Photographers and packages are booked for the start date only
        const itemEndDate = isGear ? endDate || startDate : null
        if (itemType !== 'PACKAGE') {
          const clash = await findClash(tx, itemType, itemId, startDate, itemEndDate || startDate)
          if (clash) {
            throw new BookingError(`"${found.name}" ถูกจองแล้วในช่วงวันที่เลือก กรุณาเลือกวันอื่น`, 409)
          }
        }

        const { total, deposit } = priceLine(found.unitPrice, quantity, days, isGear)
        created.push(
          await tx.booking.create({
            data: {
              userId,
              orderRef,
              itemType,
              itemId,
              itemName: found.name,
              quantity,
              startDate,
              endDate: itemEndDate,
              totalPrice: total,
              deposit,
              status: 'PENDING',
              ...contactFields
            }
          })
        )
      }

      await tx.cartItem.deleteMany({ where: { userId } })
      return created
    })

    return NextResponse.json(
      {
        message: 'ทำการจองสำเร็จเรียบร้อยแล้ว',
        orderRef,
        bookings: createdBookings
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างรายการจอง' },
      { status: 500 }
    )
  }
}
