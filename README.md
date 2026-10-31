# Cool Photos — เช่ากล้อง & จองช่างภาพ

เว็บไซต์ Next.js + PostgreSQL (Prisma) + NextAuth

## รันบนเครื่องตัวเอง

ฐานข้อมูลอยู่บน Neon (โปรเจกต์ `coolphotos`, ภูมิภาคสิงคโปร์) แยกเป็น 2 branch:

| Branch | ใช้กับ | ไฟล์ที่เก็บค่าเชื่อมต่อ |
| --- | --- | --- |
| `main` | เว็บจริงบน Vercel | `.env.vercel` (ไม่อยู่ใน git) |
| `dev` | ทดลองบนเครื่องนี้ ลบ/รีเซ็ตได้ไม่กระทบเว็บจริง | `.env` |

```bash
npm install
npm run dev                   # เปิด http://localhost:3000 (ใช้ branch dev)
```

บัญชีทดสอบบน branch `dev`: แอดมิน `admin@coolphotos.com` / `admin123`, ลูกค้า `test@coolphotos.com` / `test123`
รีเซ็ตข้อมูล dev: `npm run db:seed -- --force`

ทำงานแบบไม่ใช้อินเทอร์เน็ต: รัน `npm run db:local` แล้วเปลี่ยน `DATABASE_URL`/`DIRECT_URL` ใน `.env` เป็น
`postgresql://postgres:postgres@localhost:5432/coolphotos` จากนั้น `npm run db:migrate && npm run db:seed`

## ตั้งค่า (.env)

| ตัวแปร | ความหมาย |
| --- | --- |
| `DATABASE_URL` | ที่อยู่ฐานข้อมูล (บน Vercel ใช้ pooled connection string) |
| `DIRECT_URL` | ที่อยู่ฐานข้อมูลแบบ direct ใช้ตอนรัน migration (ในเครื่องใช้ค่าเดียวกับ `DATABASE_URL`) |
| `NEXTAUTH_SECRET` | รหัสลับสำหรับระบบล็อกอิน ห้ามเปิดเผย |
| `NEXTAUTH_URL` | ที่อยู่เว็บ เช่น `https://coolphotos.example.com` |
| `PROMPTPAY_ID` | เบอร์โทร (10 หลัก) หรือเลขบัตรประชาชน/เลขผู้เสียภาษี (13 หลัก) ที่ผูกพร้อมเพย์ของร้าน |
| `PROMPTPAY_NAME` | ชื่อบัญชีที่ลูกค้าจะเห็นในแอปธนาคาร (ไม่บังคับ) |

ถ้าไม่ได้ตั้ง `PROMPTPAY_ID` ลูกค้ายังจองได้ แต่จะเห็นข้อความว่าทีมงานจะติดต่อกลับเรื่องการชำระเงินแทน QR

## งานแอดมิน

- หน้า `/admin` (เมนูผู้ใช้ → "จัดการการจอง") ดูข้อมูลลูกค้าและเปลี่ยนสถานะการจอง
- ลูกค้าจ่ายผ่าน QR พร้อมเพย์แล้วส่งสลิปพร้อม **รหัสคำสั่งจอง** (เช่น `CP3F9A1C`) ทาง LINE
  เมื่อตรวจยอดเงินเข้าแล้วให้กด "ยืนยันคิว" และกด "ส่งคืน/เสร็จสิ้น" เมื่อจบงาน
- การจองที่ถูกยกเลิกจะคืนคิวให้คนอื่นจองวันนั้นได้
- เพิ่มแอดมินคนใหม่: ให้สมัครสมาชิกบนเว็บก่อน แล้วรัน `npm run make-admin -- อีเมล@ตัวอย่าง.com`

## นำขึ้นเว็บจริงด้วย Vercel

1. ฐานข้อมูล Neon สร้างไว้แล้ว (branch `main` มีตารางและข้อมูลเริ่มต้นแล้ว รหัสแอดมินอยู่ใน `.env.admin`)
2. Push โปรเจกต์ขึ้น GitHub แล้ว Import ที่ [vercel.com/new](https://vercel.com/new)
3. ใส่ Environment Variables ใน Vercel:
   - `DATABASE_URL`, `DIRECT_URL` = คัดลอกจาก `.env.vercel`
   - `NEXTAUTH_SECRET` = สร้างใหม่ด้วย `openssl rand -base64 32` (อย่าใช้ค่าเดียวกับในเครื่อง)
   - `NEXTAUTH_URL` = ที่อยู่เว็บจริง เช่น `https://coolphotos.vercel.app`
   - `PROMPTPAY_ID`, `PROMPTPAY_NAME`
4. กด Deploy — ระบบจะสร้างตารางในฐานข้อมูลให้อัตโนมัติ (`vercel-build` รัน `prisma migrate deploy`)
5. ล็อกอินแอดมินบนเว็บจริงด้วยอีเมลและรหัสใน `.env.admin`

## แก้โครงสร้างฐานข้อมูล

แก้ `prisma/schema.prisma` แล้วรัน `npm run db:migrate -- --name อธิบายสิ่งที่เปลี่ยน`
จะได้ไฟล์ใน `prisma/migrations/` ให้ commit ไฟล์นั้นด้วย Vercel จะนำไปใช้ตอน deploy ครั้งถัดไป
