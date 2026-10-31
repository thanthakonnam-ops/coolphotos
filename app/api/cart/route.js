import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ITEM_TYPES, findItem } from '@/lib/catalog'
import { MAX_QUANTITY } from '@/lib/pricing'

const MAX_ITEMS = 50

// Database row → the shape CartProvider uses in the browser
function toClientItem(row) {
  return {
    id: row.itemId,
    type: row.itemType.toLowerCase(),
    name: row.itemName,
    price: row.price,
    quantity: row.quantity,
    image: row.image || '',
    category: row.category || ''
  }
}

async function requireUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id || null
}

// GET /api/cart - Return cart items for authenticated user
export async function GET() {
  try {
    const userId = await requireUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนดูตะกร้าสินค้า' },
        { status: 401 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { addedAt: 'asc' }
    })

    return NextResponse.json(cartItems.map(toClientItem))
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้าสินค้า' },
      { status: 500 }
    )
  }
}

// PUT /api/cart - Replace the user's whole cart
// Body: { items: [{ type, id, quantity }] }. Names, prices and images are taken
// from the database; items that no longer exist are dropped.
export async function PUT(request) {
  try {
    const userId = await requireUserId()
    if (!userId) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนแก้ไขตะกร้าสินค้า' },
        { status: 401 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 })
    }

    const items = body?.items
    if (!Array.isArray(items) || items.length > MAX_ITEMS) {
      return NextResponse.json(
        { error: `ตะกร้าต้องเป็นรายการสินค้าไม่เกิน ${MAX_ITEMS} รายการ` },
        { status: 400 }
      )
    }

    const rows = []
    const seen = new Set()
    for (const item of items) {
      const itemType = ITEM_TYPES[item?.type]
      const itemId = typeof item?.id === 'string' ? item.id : ''
      const quantity = Math.min(Math.max(Math.floor(Number(item?.quantity)) || 1, 1), MAX_QUANTITY)
      const key = `${itemType}:${itemId}`
      if (!itemType || !itemId || seen.has(key)) continue

      const found = await findItem(prisma, itemType, itemId)
      if (!found) continue
      seen.add(key)
      rows.push({
        userId,
        itemType,
        itemId,
        itemName: found.name,
        price: found.unitPrice,
        image: found.image || '',
        category: found.category || '',
        quantity
      })
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { userId } }),
      prisma.cartItem.createMany({ data: rows })
    ])

    return NextResponse.json(rows.map(toClientItem))
  } catch (error) {
    console.error('Error saving cart:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกตะกร้าสินค้า' },
      { status: 500 }
    )
  }
}
