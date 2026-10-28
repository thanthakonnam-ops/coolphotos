'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartProvider';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartItems, clearCart, getCartTotal } = useCart();

  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('promptpay'); // 'promptpay' | 'credit_card'
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBookingCount, setCreatedBookingCount] = useState(0);

  // Prefill contact info from session
  useEffect(() => {
    if (session?.user) {
      setContactInfo((prev) => ({
        ...prev,
        name: prev.name || session.user.name || '',
        email: prev.email || session.user.email || '',
      }));
    }
  }, [session]);

  // Redirect if not authenticated once status is resolved
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  const subtotal = getCartTotal();
  const deposit = Math.round(subtotal * 0.3);
  const grandTotal = subtotal + deposit;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!contactInfo.name.trim() || !contactInfo.phone.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล และเบอร์โทรศัพท์สำหรับติดต่อ');
      return;
    }

    if (!contactInfo.address.trim()) {
      setError('กรุณากรอกที่อยู่สำหรับการจัดส่งอุปกรณ์หรือนัดหมายสถานที่');
      return;
    }

    if (cartItems.length === 0) {
      setError('ไม่มีรายการในตะกร้าสินค้า');
      return;
    }

    try {
      setSubmitting(true);

      const itemsPayload = cartItems.map((item) => ({
        itemType:
          item.type === 'photographer'
            ? 'PHOTOGRAPHER'
            : item.type === 'package'
            ? 'PACKAGE'
            : 'GEAR',
        itemName: item.name,
        startDate: contactInfo.startDate || new Date().toISOString().split('T')[0],
        endDate: contactInfo.endDate || null,
        totalPrice: Number((item.price || 0) * (item.quantity || 1)),
        status: 'PENDING',
      }));

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsPayload,
          contactInfo,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการบันทึกการจอง');
        setSubmitting(false);
      } else {
        setCreatedBookingCount(itemsPayload.length);
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
                        value={contactInfo.name}
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
                        value={contactInfo.phone}
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
                        value={contactInfo.email}
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
                        value={contactInfo.startDate}
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
                        value={contactInfo.endDate}
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
                        value={contactInfo.address}
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
                        value={contactInfo.notes}
                        onChange={handleInputChange}
                        placeholder="เช่น ต้องการสายคล้องกล้องเพิ่ม หรือเวลารับสินค้าเฉพาะเจาะจง"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-700">
                    <span className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm">
                      2
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      เลือกช่องทางชำระเงิน
                    </h2>
                  </div>

                  {/* Payment Tabs */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('promptpay')}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-sm font-semibold transition ${
                        paymentMethod === 'promptpay'
                          ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-md shadow-orange-500/10'
                          : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <i className="fa-solid fa-qrcode text-2xl"></i>
                      <span>พร้อมเพย์ QR Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-sm font-semibold transition ${
                        paymentMethod === 'credit_card'
                          ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-md shadow-orange-500/10'
                          : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <i className="fa-regular fa-credit-card text-2xl"></i>
                      <span>บัตรเครดิต / เดบิต</span>
                    </button>
                  </div>

                  {/* PromptPay UI */}
                  {paymentMethod === 'promptpay' && (
                    <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold mb-4">
                        <i className="fa-solid fa-bolt"></i>
                        <span>PromptPay Instant Payment</span>
                      </div>

                      {/* Mock QR Code Box */}
                      <div className="w-56 h-56 mx-auto bg-slate-800 rounded-2xl border-2 border-dashed border-slate-600 flex flex-col items-center justify-center p-4 relative group shadow-inner">
                        <i className="fa-solid fa-qrcode text-6xl text-slate-500 mb-2"></i>
                        <span className="text-sm font-bold text-slate-200">
                          QR Code PromptPay
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          สแกนเพื่อชำระเงิน ฿{grandTotal.toLocaleString()}
                        </span>
                        <div className="mt-3 px-3 py-1 rounded-lg bg-orange-500/20 text-orange-300 text-[10px] font-mono">
                          (โหมดจำลองการชำระเงิน Mockup)
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-sm mx-auto">
                        สามารถใช้แอปพลิเคชันของธนาคารใดก็ได้เพื่อสแกน QR Code นี้
                        ระบบจะยืนยันคำสั่งซื้อโดยอัตโนมัติทันที
                      </p>
                    </div>
                  )}

                  {/* Mock Credit Card Form UI */}
                  {paymentMethod === 'credit_card' && (
                    <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          หมายเลขบัตรเครดิต (Card Number)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="cardNumber"
                            maxLength="19"
                            value={cardInfo.cardNumber}
                            onChange={handleCardChange}
                            placeholder="4000 1234 5678 9010"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                          />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1.5 text-lg">
                            <i className="fa-brands fa-cc-visa"></i>
                            <i className="fa-brands fa-cc-mastercard"></i>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          ชื่อบนบัตร (Cardholder Name)
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={cardInfo.cardName}
                          onChange={handleCardChange}
                          placeholder="SOMCHAI JAIDEE"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            วันหมดอายุ (MM/YY)
                          </label>
                          <input
                            type="text"
                            name="expiry"
                            maxLength="5"
                            value={cardInfo.expiry}
                            onChange={handleCardChange}
                            placeholder="12/28"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            รหัส CVV / CVC
                          </label>
                          <input
                            type="password"
                            name="cvv"
                            maxLength="4"
                            value={cardInfo.cvv}
                            onChange={handleCardChange}
                            placeholder="•••"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 text-center"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 text-center pt-2">
                        <i className="fa-solid fa-lock mr-1"></i>
                        ข้อมูลบัตรได้รับการจำลองแบบ Mock UI ปลอดภัย 100%
                      </p>
                    </div>
                  )}
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
                  {cartItems.map((item) => (
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
                        </span>
                      </div>
                      <span className="font-bold text-slate-200">
                        ฿{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-sm pt-2">
                  <div className="flex justify-between text-slate-300">
                    <span>ค่าเช่า / ค่าบริการ</span>
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
                  เมื่อคลิกยืนยันการจอง คุณยอมรับเงื่อนไขการเช่าและนโยบายความเป็นส่วนตัวของ Cool photos
                </p>
              </div>
            </div>
          </form>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-3xl">
                <i className="fa-solid fa-check"></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                ทำการจองสำเร็จเรียบร้อย!
              </h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                ระบบได้บันทึกคำสั่งจอง {createdBookingCount} รายการ ของคุณแล้ว ทีมงานจะติดต่อกลับเพื่อยืนยันคิวและจัดเตรียมอุปกรณ์
              </p>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>สถานะคำสั่ง:</span>
                  <span className="text-amber-400 font-semibold">รอยืนยัน (PENDING)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ผู้จอง:</span>
                  <span className="text-white">{contactInfo.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>เบอร์ติดต่อ:</span>
                  <span className="text-white">{contactInfo.phone}</span>
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
