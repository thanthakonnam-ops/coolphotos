import Link from 'next/link';
import InfoPage, { ContactSection } from '@/components/InfoPage';

export const metadata = {
  title: 'คำถามที่พบบ่อย - Cool Photos',
};

const faqs = [
  {
    q: 'จองอุปกรณ์หรือช่างภาพอย่างไร?',
    a: (
      <>
        เลือกอุปกรณ์ ช่างภาพ หรือแพ็กเกจที่ต้องการแล้วกดใส่ตะกร้า จากนั้นไปที่{' '}
        <Link href="/cart">ตะกร้าสินค้า</Link> เลือกวันที่ กรอกข้อมูลติดต่อ และยืนยันการจอง
        (ต้อง<Link href="/register">สมัครสมาชิก</Link>และเข้าสู่ระบบก่อน)
      </>
    ),
  },
  {
    q: 'คิดค่าเช่าอย่างไร?',
    a: 'อุปกรณ์คิดเป็นรายวันตามจำนวนวันระหว่างวันรับและวันส่งคืน (รับและคืนวันเดียวกันนับเป็น 1 วัน) ช่างภาพคิดเป็นครึ่งวัน (4 ชั่วโมง) ต่อการจอง 1 ครั้ง และแพ็กเกจเป็นราคาเหมาต่อแพ็กเกจ',
  },
  {
    q: 'ต้องวางเงินมัดจำเท่าไร และได้คืนเมื่อไร?',
    a: 'เงินมัดจำคือ 30% ของค่าเช่า/ค่าบริการ และจะได้รับคืนเต็มจำนวนภายใน 24 ชั่วโมงหลังส่งคืนอุปกรณ์เรียบร้อย',
  },
  {
    q: 'ชำระเงินอย่างไร?',
    a: 'หลังยืนยันการจอง ทีมงานจะติดต่อกลับเพื่อยืนยันคิวและแจ้งช่องทางการชำระเงิน การจองจะมีสถานะ "รอยืนยัน" จนกว่าทีมงานจะยืนยัน',
  },
  {
    q: 'ยกเลิกการจองได้ไหม?',
    a: (
      <>
        ยกเลิกได้ฟรีหากแจ้งก่อนวันใช้งานอย่างน้อย 48 ชั่วโมง โดยติดต่อทีมงานผ่านช่องทางด้านล่าง
        ดูรายละเอียดเพิ่มเติมใน<Link href="/terms">เงื่อนไขการเช่า</Link>
      </>
    ),
  },
  {
    q: 'ดูสถานะการจองได้ที่ไหน?',
    a: (
      <>
        ดูได้ที่หน้า <Link href="/bookings">ประวัติการเช่า & จองคิว</Link> เมื่อเข้าสู่ระบบแล้ว
      </>
    ),
  },
  {
    q: 'จองอุปกรณ์ชิ้นเดียวกันซ้ำวันได้ไหม?',
    a: 'ไม่ได้ หากอุปกรณ์หรือช่างภาพถูกจองในช่วงวันที่คุณเลือกแล้ว ระบบจะแจ้งให้เลือกวันอื่น',
  },
];

export default function FaqPage() {
  return (
    <InfoPage icon="fa-circle-question" title="คำถามที่พบบ่อย (FAQ)">
      <section className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 open:border-orange-500/40"
          >
            <summary className="cursor-pointer font-semibold text-white flex items-center justify-between gap-4 list-none">
              <span>{item.q}</span>
              <i className="fa-solid fa-chevron-down text-xs text-slate-400 transition group-open:rotate-180"></i>
            </summary>
            <p className="mt-3 text-slate-300">{item.a}</p>
          </details>
        ))}
      </section>

      <ContactSection />
    </InfoPage>
  );
}
