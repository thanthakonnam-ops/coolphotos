'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Brand & Description */}
        <div className="pb-10 border-b border-slate-800/80">
          <div className="max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <i className="fa-solid fa-camera-retro text-xl"></i>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">
                Cool photos
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              แพลตฟอร์มเช่าอุปกรณ์กล้อง เลนส์ และจองคิวช่างภาพมืออาชีพครบวงจร
              ส่งเสริมเศรษฐกิจหมุนเวียน (Sharing Economy)
              ลดขยะอิเล็กทรอนิกส์เพื่อความยั่งยืน
            </p>
          </div>
        </div>

        {/* 3 Column Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 py-12">
          {/* Column 1: บริการ */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              <span>บริการ</span>
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/#rental"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                  <span>เช่ากล้อง & เลนส์</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#photographers"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                  <span>จองคิวช่างภาพ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#packages"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                  <span>แพ็กเกจสุดคุ้ม</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/gear"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                  <span>อุปกรณ์ทั้งหมด</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: ช่วยเหลือ */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              <span>ช่วยเหลือ</span>
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/#how-it-works"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                  <span>ขั้นตอนการเช่า & จองคิว</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                  <span>รายการจองของฉัน</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                  <span>คำถามที่พบบ่อย (FAQ)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                  <span>เงื่อนไขการเช่า & เงินมัดจำ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chevron-right text-[10px] text-slate-600"></i>
                  <span>นโยบายความเป็นส่วนตัว</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: ติดต่อเรา */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              <span>ติดต่อเรา</span>
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <i className="fa-brands fa-line text-emerald-400 text-lg flex-shrink-0 mt-0.5"></i>
                <div>
                  <span className="text-xs text-slate-500 block">LINE</span>
                  <a
                    href="https://line.me/ti/p/~theantn47"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-orange-400 transition-colors font-medium"
                  >
                    theantn47
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-envelope text-orange-400 text-sm flex-shrink-0 mt-1"></i>
                <div>
                  <span className="text-xs text-slate-500 block">อีเมล</span>
                  <a
                    href="mailto:theamtn2547@gmail.com"
                    className="text-white hover:text-orange-400 transition-colors font-medium"
                  >
                    theamtn2547@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-phone text-blue-400 text-sm flex-shrink-0 mt-1"></i>
                <div>
                  <span className="text-xs text-slate-500 block">เบอร์โทรศัพท์</span>
                  <a
                    href="tel:0922379475"
                    className="text-white hover:text-orange-400 transition-colors font-medium"
                  >
                    092-237-9475
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Cool photos. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <i className="fa-solid fa-shield-halved text-emerald-400 text-xs"></i>
              ระบบความปลอดภัยระดับสากล
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <i className="fa-solid fa-leaf text-emerald-400 text-xs"></i>
              ขับเคลื่อนความยั่งยืน
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
