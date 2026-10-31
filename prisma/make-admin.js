// Give an existing user admin rights without re-seeding (seeding wipes all data).
// Usage: npm run make-admin -- someone@example.com
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]?.toLowerCase().trim()
  if (!email) {
    console.error('❌ กรุณาระบุอีเมล: npm run make-admin -- someone@example.com')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`❌ ไม่พบผู้ใช้ ${email} (ต้องสมัครสมาชิกบนเว็บก่อน)`)
    process.exit(1)
  }

  await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } })
  console.log(`✅ ${email} เป็นผู้ดูแลระบบแล้ว (ให้ออกจากระบบแล้วเข้าใหม่เพื่อเห็นเมนูแอดมิน)`)
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
