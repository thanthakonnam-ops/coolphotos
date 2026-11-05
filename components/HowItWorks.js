'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    const section = sectionRef.current;
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: '01',
      title: 'เลือกอุปกรณ์ / ช่างภาพ',
      description:
        'ค้นหากล้อง เลนส์ หรือเลือกช่างภาพตามสไตล์ที่คุณชื่นชอบ เปรียบเทียบสเปกและรีวิวจากผู้ใช้งานจริง',
      icon: 'fa-magnifying-glass',
      color: 'orange',
    },
    {
      number: '02',
      title: 'เช็กคิวว่าง & ชำระมัดจำ',
      description:
        'ตรวจสอบคิวว่างได้แบบเรียลไทม์ ชำระเงินมัดจำผ่านระบบที่ปลอดภัย พร้อมรับเอกสารยืนยันการจอง',
      icon: 'fa-calendar-check',
      color: 'amber',
    },
    {
      number: '03',
      title: 'ส่งสลิป & ยืนยันคิวทาง LINE',
      description:
        'ส่งสลิปพร้อมรหัสคำสั่งจองให้ทีมงานทาง LINE เมื่อตรวจยอดแล้วทีมงานจะยืนยันคิวและนัดหมายรับ-ส่งสินค้ากับคุณ',
      icon: 'fa-comment-dots',
      color: 'emerald',
    },
    {
      number: '04',
      title: 'รับสินค้า & คืนมัดจำ',
      description:
        'รับอุปกรณ์หรือพบช่างภาพตามนัดหมาย เมื่อส่งคืนอุปกรณ์เรียบร้อย รับเงินมัดจำคืนเต็มจำนวนภายใน 24 ชั่วโมง',
      icon: 'fa-handshake',
      color: 'blue',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-20 bg-slate-900 text-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs sm:text-sm font-semibold border border-orange-500/20 mb-4">
            <i className="fa-solid fa-list-check"></i>
            <span>ขั้นตอนง่ายๆ ใน 4 สเต็ป</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            ขั้นตอนการใช้บริการ Cool photos
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            เช่ากล้องและจองคิวช่างภาพง่ายและปลอดภัย โปร่งใสในทุกขั้นตอน
            ตอบโจทย์ทั้งผู้เช่าและครีเอเตอร์
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500/20 via-emerald-500/20 to-blue-500/20 -translate-y-12 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {steps.map((step, index) => {
              // Delay styling based on index
              const delayClass = [
                'delay-100',
                'delay-200',
                'delay-300',
                'delay-500',
              ][index];

              return (
                <div
                  key={step.number}
                  className={`bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-700 ease-out hover:border-orange-500/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-500/10 group ${delayClass} ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-12'
                  }`}
                >
                  <div>
                    {/* Top row: Number box & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-extrabold text-base flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                        {step.number}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-300 text-base group-hover:text-orange-400 transition-colors">
                        <i className={`fa-solid ${step.icon}`}></i>
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors mb-3">
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Footer Accent */}
                  <div className="pt-6 mt-6 border-t border-slate-700/50 flex items-center text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                    <span>ขั้นตอนที่ {index + 1}</span>
                    <i className="fa-solid fa-arrow-right ml-auto text-[10px] transform group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
