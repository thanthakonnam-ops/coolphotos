const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 เริ่มต้นการ Seed ข้อมูล...')

  // Seeding wipes everything — refuse if real customers have already booked
  const bookingCount = await prisma.booking.count()
  if (bookingCount > 0 && !process.argv.includes('--force')) {
    console.error(`❌ มีรายการจองอยู่แล้ว ${bookingCount} รายการ การ Seed จะลบข้อมูลทั้งหมด`)
    console.error('   ถ้าต้องการลบจริง ให้รัน: npm run db:seed -- --force')
    process.exit(1)
  }

  // ล้างข้อมูลเก่าตามลำดับความสัมพันธ์
  console.log('🗑️  กำลังล้างข้อมูลเก่า...')
  await prisma.cartItem.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.user.deleteMany()
  await prisma.gear.deleteMany()
  await prisma.photographer.deleteMany()
  await prisma.package.deleteMany()

  // 1. Seed ผู้ใช้งาน (Users)
  console.log('👤 กำลังสร้างผู้ใช้งานเริ่มต้น...')
  // Set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD when seeding the production database
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@coolphotos.com'
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn('⚠️  ใช้รหัสผ่านแอดมินเริ่มต้น admin123 — ห้ามใช้กับเว็บจริง (ตั้ง SEED_ADMIN_PASSWORD)')
  }
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', 12)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      phone: '0812345678',
      role: 'ADMIN'
    }
  })
  console.log(`✅ สร้างผู้ดูแลระบบเรียบร้อย: ${admin.email}`)

  // Demo customer with a known password — only for local development
  if (!process.env.SEED_ADMIN_PASSWORD) {
    const testUser = await prisma.user.create({
      data: {
        name: 'ทดสอบ ผู้ใช้',
        email: 'test@coolphotos.com',
        password: await bcrypt.hash('test123', 12),
        phone: '0898765432',
        role: 'USER'
      }
    })
    console.log(`✅ สร้างผู้ใช้ทดสอบเรียบร้อย: ${testUser.email}`)
  }

  // 2. Seed อุปกรณ์ (Gear)
  console.log('📷 กำลังสร้างรายการอุปกรณ์...')
  const gearItems = [
    {
      name: 'Canon 930',
      category: 'Compact Digital',
      description: '',
      pricePerDay: 300,
      image: '/images/gear/canon-930.jpg',
      status: 'AVAILABLE',
      queueDate: ''
    },
    {
      name: 'Canon 31s',
      category: 'Compact Digital',
      description: '',
      pricePerDay: 300,
      image: '/images/gear/canon-31s.jpg',
      status: 'AVAILABLE',
      queueDate: ''
    },
    {
      name: 'Canon 105',
      category: 'Compact Digital',
      description: '',
      pricePerDay: 300,
      image: '/images/gear/canon-105.jpg',
      status: 'AVAILABLE',
      queueDate: ''
    },
    {
      name: 'Canon G9X',
      category: 'Compact Digital',
      description: '',
      pricePerDay: 500,
      image: '/images/gear/canon-g9x.jpg',
      status: 'AVAILABLE',
      queueDate: ''
    }
  ]

  for (const item of gearItems) {
    await prisma.gear.create({ data: item })
  }
  console.log(`✅ สร้างรายการอุปกรณ์เรียบร้อย (${gearItems.length} รายการ)`)

  // 3. Seed ช่างภาพ (Photographers)
  console.log('📸 กำลังสร้างรายชื่อช่างภาพ...')
  const photographers = [
    {
      name: 'คุณเมย์ (May Creator)',
      specialty: 'พอร์ตเทรต, รับปริญญา, แฟชั่น',
      rating: 4.9,
      reviewCount: 48,
      pricePerHalf: 3500,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      image1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      image2: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      image3: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      bio: 'ช่างภาพสายพอร์ตเทรตและแฟชั่น ประสบการณ์กว่า 5 ปี โทนภาพละมุนเป็นธรรมชาติ พร้อมแนะนำท่าโพสอย่างเป็นกันเอง'
    },
    {
      name: 'คุณเบสท์ (Best Visual)',
      specialty: 'อีเวนต์, คอนเสิร์ต, วิดีโอ',
      rating: 5.0,
      reviewCount: 62,
      pricePerHalf: 4500,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      image1: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      image2: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
      image3: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      bio: 'ช่างภาพงานอีเวนต์และคอนเสิร์ต จับจังหวะอารมณ์แม่นยำ แสงสีจัดจ้าน เก็บทุกโมเมนต์สำคัญไม่ให้พลาดแม้แต่วินาทีเดียว'
    },
    {
      name: 'คุณต่าย (Studio Product)',
      specialty: 'สินค้า, อาหาร, โฆษณา',
      rating: 4.8,
      reviewCount: 31,
      pricePerHalf: 5000,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      image1: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      image2: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      image3: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      bio: 'ช่างภาพสตูดิโอ ถ่ายภาพสินค้า อาหาร และงานโฆษณา จัดแสงระดับพรีเมียม เพื่อภาพลักษณ์ที่โดดเด่นและเพิ่มยอดขายให้แบรนด์'
    }
  ]

  for (const photographer of photographers) {
    await prisma.photographer.create({ data: photographer })
  }
  console.log(`✅ สร้างรายชื่อช่างภาพเรียบร้อย (${photographers.length} คน)`)

  // 4. Seed แพ็กเกจ (Packages)
  console.log('📦 กำลังสร้างแพ็กเกจบริการ...')
  const packages = [
    {
      name: 'Starter',
      description: 'เหมาะสำหรับผู้เริ่มต้น ถ่ายภาพโปรไฟล์ส่วนตัว หรือทำคอนเทนต์ลงโซเชียลมีเดียทั่วไป',
      price: 1200,
      includes: 'ช่างภาพ 2 ชั่วโมง, ปรับแต่งโทนสี 30 ภาพ, ถ่ายไม่จำกัดจำนวน, ส่งงานผ่าน Google Drive ใน 48 ชม.',
      featured: false
    },
    {
      name: 'Creator',
      description: 'แพ็กเกจยอดนิยม ครบเซ็ตทั้งช่างภาพและอุปกรณ์ระดับโปร เหมาะสำหรับงานรับปริญญา งานหมั้น หรือรีวิว',
      price: 5500,
      includes: 'ช่างภาพ 4 ชั่วโมง (ครึ่งวัน), กล้อง Sony A7IV + เลนส์โปร, วิดีโอไฮไลท์สั้น 1 คลิป, ปรับแต่งโทนสีภาพทั้งหมด, ส่งงานด่วนใน 24 ชม.',
      featured: true
    },
    {
      name: 'Pro',
      description: 'จัดเต็มระดับโปรดักชัน สำหรับงานอีเวนต์ใหญ่ งานแต่งงาน หรือแคมเปญโฆษณาแบรนด์',
      price: 12000,
      includes: 'ช่างภาพ 2 คน เต็มวัน (8 ชม.), ช่างวิดีโอ 4K Cinema + โดรนมุมสูง, เซ็ตไฟสตูดิโอเต็มระบบ, รีทัชพิเศษ 50 ภาพ, ส่งงานด่วนใน 24 ชม.',
      featured: false
    }
  ]

  for (const pkg of packages) {
    await prisma.package.create({ data: pkg })
  }
  console.log(`✅ สร้างแพ็กเกจเรียบร้อย (${packages.length} แพ็กเกจ)`)

  console.log('🎉 การ Seed ข้อมูลเสร็จสมบูรณ์เรียบร้อยแล้ว!')
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ Seed ข้อมูล:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
