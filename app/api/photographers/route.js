import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get('specialty')
    const sort = searchParams.get('sort')

    const where = {}

    // Filter by specialty if provided and not "all"
    if (specialty && specialty !== 'ALL' && specialty !== 'ทั้งหมด') {
      where.specialty = {
        contains: specialty
      }
    }

    // Determine sorting
    let orderBy = { createdAt: 'desc' }
    if (sort === 'rating') {
      orderBy = { rating: 'desc' }
    } else if (sort === 'price_asc') {
      orderBy = { pricePerHalf: 'asc' }
    } else if (sort === 'price_desc') {
      orderBy = { pricePerHalf: 'desc' }
    }

    const photographers = await prisma.photographer.findMany({
      where,
      orderBy
    })

    return NextResponse.json(photographers)
  } catch (error) {
    console.error('Error fetching photographers:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลช่างภาพ' },
      { status: 500 }
    )
  }
}
