'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart();

  const subtotal = getCartTotal();
  const deposit = Math.round(subtotal * 0.3); // มัดจำ 30%
  const total = subtotal + deposit;

  const getTypeLabel = (type) => {
    switch (type) {
      case 'package':
        return { label: 'แพ็กเกจ', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'photographer':
        return { label: 'ช่างภาพ', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'gear':
      default:
        return { label: 'อุปกรณ์', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb / Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link href="/" className="hover:text-white transition">หน้าหลัก</Link>
            <span>/</span>
            <span className="text-orange-400">ตะกร้าสินค้า</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa-solid fa-bag-shopping text-orange-500"></i>
            <span>ตะกร้าสินค้าของฉัน</span>
            {cartItems.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                {cartItems.length} รายการ
              </span>
            )}
          </h1>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-12 text-center max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6 text-slate-500 text-3xl">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              ตะกร้าสินค้าของคุณยังว่างอยู่
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              คุณยังไม่ได้เลือกอุปกรณ์หรือบริการใดๆ สำรวจกล้อง เลนส์ และช่างภาพคุณภาพของเราเพื่อเริ่มต้น
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#rental"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all"
              >
                <i className="fa-solid fa-camera"></i>
                <span>เลือกเช่าอุปกรณ์</span>
              </Link>
              <Link
                href="/#photographers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <i className="fa-solid fa-user-tie"></i>
                <span>จองคิวช่างภาพ</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                <span>รายการที่เลือก</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5"
                >
                  <i className="fa-regular fa-trash-can"></i>
                  <span>ล้างตะกร้า</span>
                </button>
              </div>

              {cartItems.map((item) => {
                const badge = getTypeLabel(item.type);
                const itemSubtotal = (item.price || 0) * (item.quantity || 1);

                return (
                  <div
                    key={`${item.id}-${item.type}`}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 transition hover:border-slate-600"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700">
                      <img
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80'
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        {item.category && (
                          <span className="text-[11px] text-slate-400">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white truncate mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-orange-400 font-semibold">
                        ฿{Number(item.price || 0).toLocaleString()}
                        <span className="text-slate-400 font-normal"> / หน่วย</span>
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, (item.quantity || 1) - 1)
                        }
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition active:scale-95 text-xs"
                        aria-label="Decrease quantity"
                      >
                        <i className="fa-solid fa-minus"></i>
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white">
                        {item.quantity || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, (item.quantity || 1) + 1)
                        }
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center transition active:scale-95 text-xs"
                        aria-label="Increase quantity"
                      >
                        <i className="fa-solid fa-plus"></i>
                      </button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-700/60 gap-2">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block sm:hidden">ยอดรวม</span>
                        <span className="text-base font-extrabold text-white">
                          ฿{itemSubtotal.toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-slate-700/50"
                        title="ลบรายการนี้"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4">
                <Link
                  href="/#rental"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-400 transition"
                >
                  <i className="fa-solid fa-arrow-left text-xs"></i>
                  <span>เลือกเช่าอุปกรณ์เพิ่ม</span>
                </Link>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl sticky top-28 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-4 border-b border-slate-700">
                <i className="fa-solid fa-receipt text-orange-500"></i>
                <span>สรุปคำสั่งซื้อ</span>
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <span>ค่าบริการ / ค่าเช่ารวม</span>
                  <span className="font-semibold text-white">
                    ฿{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span>เงินมัดจำประกันความเสียหาย</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      30%
                    </span>
                  </div>
                  <span className="font-semibold text-white">
                    ฿{deposit.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 leading-relaxed bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                  <i className="fa-solid fa-shield-check mr-1"></i>
                  เงินมัดจำจะได้รับคืนเต็มจำนวนภายใน 24 ชม. หลังจากส่งคืนอุปกรณ์เรียบร้อย
                </p>

                <div className="pt-4 border-t border-slate-700 flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-bold text-white block">
                      ยอดชำระสุทธิ
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (รวมค่าเช่าและเงินมัดจำ)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-orange-400">
                      ฿{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full py-4 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>ดำเนินการจอง</span>
                <i className="fa-solid fa-arrow-right text-sm"></i>
              </Link>

              {/* Badges / Guarantees */}
              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-lock text-emerald-400"></i>
                  <span>การชำระเงินปลอดภัยและเข้ารหัส SSL 256-bit</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-arrow-rotate-left text-orange-400"></i>
                  <span>ยกเลิกฟรีก่อนวันใช้งาน 48 ชั่วโมง</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
