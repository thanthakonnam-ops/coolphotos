'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartProvider';
import PromptPayQR from '@/components/PromptPayQR';
import { todayStr, rentalDays, priceLine } from '@/lib/pricing';

// Dates picked in the home page search box are carried over to checkout
function initialDates() {
  const today = todayStr();
  try {
    const saved = JSON.parse(sessionStorage.getItem('coolphotos_dates'));
    if (saved?.start >= today) {
      return { startDate: saved.start, endDate: saved.end >= saved.start ? saved.end : '' };
    }
  } catch {
    // Not in a browser or nothing saved
  }
  return { startDate: today, endDate: '' };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, clearCart } = useCart();

  // name/email stay null until typed so they can default to the logged-in user
  const [contactInfo, setContactInfo] = useState(() => ({
    name: null,
    phone: '',
    email: null,
    address: '',
    notes: '',
    ...initialDates(),
  }));
  const contact = {
    ...contactInfo,
    name: contactInfo.name ?? session?.user?.name ?? '',
    email: contactInfo.email ?? session?.user?.email ?? '',
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBookingCount, setCreatedBookingCount] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [orderRef, setOrderRef] = useState('');

  // Redirect if not authenticated once status is resolved
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  const today = todayStr();
  const days = rentalDays(contact.startDate, contact.endDate);
  const lines = cartItems.map((item) => ({
    item,
    ...priceLine(Number(item.price) || 0, item.quantity || 1, days, item.type === 'gear'),
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const deposit = lines.reduce((sum, line) => sum + line.deposit, 0);
  const grandTotal = subtotal + deposit;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => {
      const next = { ...prev, [name]: value };
      // A return date before the new start date is no longer valid
      if (name === 'startDate' && next.endDate && value && next.endDate < value) next.endDate = '';
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!contact.name.trim() || !contact.phone.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล และเบอร์โทรศัพท์สำหรับติดต่อ');
      return;
    }

    if (!contact.address.trim()) {
      setError('กรุณากรอกที่อยู่สำหรับการจัดส่งอุปกรณ์หรือนัดหมายสถานที่');
      return;
    }

    if (contact.endDate && contact.endDate < contact.startDate) {
      setError('วันที่ส่งคืนต้องไม่ก่อนวันที่เริ่มต้นเช่า');
      return;
    }

    if (cartItems.length === 0) {
      setError('ไม่มีรายการในตะกร้าสินค้า');
      return;
    }

    try {
      setSubmitting(true);

      // Only ids and quantities are sent — the server looks up the real prices
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            itemType: item.type,
            itemId: String(item.id),
            quantity: item.quantity || 1,
          })),
          startDate: contact.startDate,
          endDate: contact.endDate || null,
          contact: {
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            address: contact.address,
            notes: contact.notes,
          },
          paymentMethod: 'promptpay',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการบันทึกการจอง');
        setSubmitting(false);
      } else {
        setCreatedBookingCount(data.bookings.length);
        setOrderRef(data.orderRef);
        setPaidTotal(
          data.bookings.reduce((sum, b) => sum + b.totalPrice + b.deposit, 0)
        );
        try {
          sessionStorage.removeItem('coolphotos_dates');
        } catch {
          // ignore
        }
        clearCart();
        setSubmitting(false);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl text-orange-500 mb-3"></i>
          <p className="text-slate-400 text-sm">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-white transition">หน้าหลัก</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-white transition">ตะกร้าสินค้า</Link>
            <span>/</span>
            <span className="text-orange-400">ชำระเงินและยืนยันการจอง</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa-solid fa-credit-card text-orange-500"></i>
            <span>เช็กเอาท์ & ยืนยันคำสั่งซื้อ</span>
          </h1>
        </div>

        {cartItems.length === 0 && !showSuccessModal ? (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-12 text-center max-w-xl mx-auto my-12">
            <i className="fa-solid fa-bag-shopping text-4xl text-slate-500 mb-4 block"></i>
            <h2 className="text-xl font-bold text-white mb-2">
              ไม่มีรายการที่ต้องชำระเงิน
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              ตะกร้าสินค้าของคุณว่างเปล่า โปรดเลือกอุปกรณ์ที่ต้องการก่อนดำเนินการ
            </p>
            <Link
              href="/#rental"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 transition"
            >
              <span>กลับไปเลือกอุปกรณ์</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3 max-w-4xl">
                <i className="fa-solid fa-triangle-exclamation text-base mt-0.5 flex-shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Contact info & Payment forms */}
              <div className="lg:col-span-2 space-y-8">
                {/* 1. Contact & Delivery Info */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-700">
                    <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm">
                      1
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      ข้อมูลติดต่อและสถานที่จัดส่ง / นัดหมาย
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        ชื่อ-นามสกุล ผู้เช่า <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={contact.name}
                        onChange={handleInputChange}
                        placeholder="สมชาย ใจดี"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        เบอร์โทรศัพท์ที่ติดต่อได้ <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={contact.phone}
                        onChange={handleInputChange}
                        placeholder="081-234-5678"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        อีเมล (สำหรับรับเอกสารใบเสร็จ)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={contact.email}
                        onChange={handleInputChange}
                        placeholder="user@example.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        วันที่เริ่มต้นเช่า / นัดหมาย
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        min={today}
                        value={contact.startDate}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 [color-scheme:dark]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        วันที่ส่งคืนอุปกรณ์ (ถ้ามี)
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        min={contact.startDate || today}
                        value={contact.endDate}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 [color-scheme:dark]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        ที่อยู่สำหรับการจัดส่ง หรือสถานที่นัดพบช่างภาพ <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        rows="3"
                        name="address"
                        required
                        value={contact.address}
                        onChange={handleInputChange}
                        placeholder="บ้านเลขที่, ซอย, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        หมายเหตุเพิ่มเติมถึงทีมงาน (ไม่บังคับ)
                      </label>
                      <input
                        type="text"
                        name="notes"
                        value={contact.notes}
                        onChange={handleInputChange}
                        placeholder="เช่น ต้องการสายคล้องกล้องเพิ่ม หรือเวลารับสินค้าเฉพาะเจาะจง"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-700">
                    <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm">
                      2
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      การชำระเงิน
                    </h2>
                  </div>

                  <div className="flex items-start gap-4 bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                      <i className="fa-solid fa-qrcode"></i>
                    </div>
                    <div className="text-sm text-slate-300 space-y-1.5">
                      <p className="font-semibold text-white">พร้อมเพย์ QR Code</p>
                      <p className="text-xs leading-relaxed text-slate-400">
                        หลังกดยืนยันการจอง ระบบจะแสดง QR พร้อมเพย์ตามยอดที่ต้องชำระ
                        สแกนจ่ายด้วยแอปธนาคารใดก็ได้ แล้วส่งสลิปให้ทีมงานทาง LINE
                        ทีมงานจะยืนยันคิวเมื่อได้รับยอดเงินแล้ว
                      </p>
                      <p className="text-xs text-slate-500">
                        เปิดดู QR อีกครั้งได้ที่หน้าประวัติการเช่า & จองคิว
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Confirm Button */}
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl sticky top-28 space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-slate-700">
                  <i className="fa-solid fa-receipt text-orange-500"></i>
                  <span>สรุปรายการจอง ({cartItems.length} รายการ)</span>
                </h2>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {lines.map(({ item, total }) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-700/40"
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-white truncate">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          จำนวน: {item.quantity || 1}
                          {item.type === 'gear' && ` × ${days} วัน`}
                        </span>
                      </div>
                      <span className="font-bold text-slate-200">
                        ฿{total.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-sm pt-2">
                  <div className="flex justify-between text-slate-300">
                    <span>
                      ค่าเช่า / ค่าบริการ
                      {lines.some(({ item }) => item.type === 'gear') && ` (${days} วัน)`}
                    </span>
                    <span className="font-medium text-white">
                      ฿{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>เงินมัดจำประกัน 30%</span>
                    <span className="font-medium text-emerald-400">
                      ฿{deposit.toLocaleString()}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-700 flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-bold text-white block">
                        ยอดที่ต้องชำระ
                      </span>
                      <span className="text-[11px] text-slate-400">
                        รวมเงินมัดจำแล้ว
                      </span>
                    </div>
                    <span className="text-2xl font-extrabold text-orange-400">
                      ฿{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>กำลังดำเนินการจอง...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-check"></i>
                      <span>ยืนยันการจองและชำระเงิน</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  เมื่อคลิกยืนยันการจอง คุณยอมรับ{' '}
                  <Link href="/terms" target="_blank" className="text-orange-400 hover:underline">
                    เงื่อนไขการเช่า
                  </Link>{' '}
                  และ{' '}
                  <Link href="/privacy" target="_blank" className="text-orange-400 hover:underline">
                    นโยบายความเป็นส่วนตัว
                  </Link>{' '}
                  ของ Cool photos
                </p>
              </div>
            </div>
          </form>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-3xl">
                <i className="fa-solid fa-check"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                ทำการจองสำเร็จเรียบร้อย!
              </h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                ระบบได้บันทึกคำสั่งจอง {createdBookingCount} รายการ ของคุณแล้ว กรุณาชำระเงินผ่าน QR ด้านล่าง
              </p>

              {orderRef && (
                <div className="mb-6">
                  <PromptPayQR orderRef={orderRef} />
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>รหัสคำสั่งจอง:</span>
                  <span className="text-white font-mono">{orderRef}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>สถานะคำสั่ง:</span>
                  <span className="text-amber-400 font-semibold">รอยืนยัน (PENDING)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ยอดรวม (รวมมัดจำ):</span>
                  <span className="text-white">฿{paidTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ผู้จอง:</span>
                  <span className="text-white">{contact.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>เบอร์ติดต่อ:</span>
                  <span className="text-white">{contact.phone}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/bookings"
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-receipt"></i>
                  <span>ดูรายการจองของฉัน</span>
                </Link>
                <Link
                  href="/"
                  className="w-full py-3 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 transition"
                >
                  กลับสู่หน้าหลัก
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
