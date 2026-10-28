import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/cart - Return cart items for authenticated user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนดูตะกร้าสินค้า' },
        { status: 401 }
      )
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      orderBy: { addedAt: 'desc' }
    })

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลตะกร้าสินค้า' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { itemType, itemId, itemName, price, image, quantity = 1 } = body

    if (!itemType || !itemId || !itemName || price === undefined) {
      return NextResponse.json(
        { error: 'ข้อมูลสินค้าไม่ครบถ้วน (ต้องมี itemType, itemId, itemName, price)' },
        { status: 400 }
      )
    }

    const itemPrice = parseInt(price, 10)
    const itemQty = parseInt(quantity, 10) || 1

    // Check if the item is already in user's cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        itemId: String(itemId),
        itemType: String(itemType)
      }
    })

    let cartItem
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + itemQty
        }
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          itemType: String(itemType),
          itemId: String(itemId),
          itemName: String(itemName),
          price: itemPrice,
          image: image || '',
          quantity: itemQty
        }
      })
    }

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเพิ่มสินค้าลงตะกร้า' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนลบสินค้า' },
        { status: 401 }
      )
    }

    let cartItemId = null

    // Check query params first
    const { searchParams } = new URL(request.url)
    cartItemId = searchParams.get('cartItemId') || searchParams.get('id')

    // If not in query params, inspect request body
    if (!cartItemId) {
      try {
        const body = await request.json()
        cartItemId = body?.cartItemId || body?.id
      } catch (e) {
        // Body was empty or not json
      }
    }

    if (!cartItemId) {
      return NextResponse.json(
        { error: 'กรุณาระบุรหัสสินค้าในตะกร้า (cartItemId)' },
        { status: 400 }
      )
    }

    // Verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    })

    if (!cartItem) {
      return NextResponse.json(
        { error: 'ไม่พบรายการสินค้านี้ในตะกร้า' },
        { status: 404 }
      )
    }

    if (cartItem.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์ในการลบรายการนี้' },
        { status: 403 }
      )
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    })

    return NextResponse.json({
      message: 'ลบรายการออกจากตะกร้าสำเร็จ',
      id: cartItemId
    })
  } catch (error) {
    console.error('Error deleting from cart:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบสินค้าออกจากตะกร้า' },
      { status: 500 }
    )
  }
}
