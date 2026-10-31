import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where = {}

    // Filter by category if provided and not "all"
    if (category && category !== 'ALL' && category !== 'ทั้งหมด') {
      where.category = {
        contains: category,
        mode: 'insensitive'
      }
    }

    // Search by name if search param provided
    if (search && search.trim() !== '') {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive'
      }
    }

    const gear = await prisma.gear.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(gear)
  } catch (error) {
    console.error('Error fetching gear:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์' },
      { status: 500 }
    )
  }
}
