'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function SDGSection() {
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animated counters
  const [reuseCount, setReuseCount] = useState(0);
  const [savingsCount, setSavingsCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const targetReuse = 1240;
    const targetSavings = 2500000;

    const easeOutQuad = (t) => t * (2 - t);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);

      setReuseCount(Math.floor(easedProgress * targetReuse));
      setSavingsCount(Math.floor(easedProgress * targetSavings));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setReuseCount(targetReuse);
        setSavingsCount(targetSavings);
      }
    };

    requestAnimationFrame(animate);
  }, [hasAnimated]);

  return (
    <section
      id="sdg"
      ref={sectionRef}
      className="py-24 bg-slate-900 text-white relative overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-semibold border border-emerald-500/30 mb-4 shadow-sm">
            <i className="fa-solid fa-earth-asia"></i>
            <span>Sharing Economy for Sustainability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Sustainable Impact Dashboard
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            เราร่วมสร้างผลกระทบเชิงบวกต่อสังคมและสิ่งแวดล้อม
            ผ่านการหมุนเวียนการใช้อุปกรณ์และการสร้างโอกาสทางอาชีพ
            ตามเป้าหมายการพัฒนาที่ยั่งยืนแห่งสหประชาชาติ (UN SDGs)
          </p>
        </div>

        {/* 3 Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Reused Gear */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 hover:border-orange-500/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-2xl mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <i className="fa-solid fa-arrows-rotate"></i>
              </div>

              <span className="text-xs font-semibold text-orange-400 tracking-wider uppercase block mb-1">
                การใช้งานหมุนเวียน
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
                {reuseCount.toLocaleString()}
                <span className="text-orange-500 ml-1">+</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-300 ml-2">
                  ครั้ง
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-700/60 pt-4 mt-2">
              จำนวนอุปกรณ์ที่ถูกส่งต่อและใช้งานวนซ้ำ
              ช่วยลดการซื้ออุปกรณ์ที่ใช้เพียงครั้งคราวและเพิ่มประสิทธิภาพทรัพยากร
            </p>
          </div>

          {/* Card 2: Savings */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 hover:border-emerald-500/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <i className="fa-solid fa-piggy-bank"></i>
              </div>

              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase block mb-1">
                มูลค่าที่ประหยัดได้
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
                <span className="text-emerald-400 text-3xl sm:text-4xl mr-1">฿</span>
                {savingsCount.toLocaleString()}
                <span className="text-emerald-400 ml-1">+</span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-700/60 pt-4 mt-2">
              ยอดเงินที่ลูกค้าและผู้สร้างสรรค์ผลงานประหยัดได้
              จากการเลือกเช่าแทนการซื้ออุปกรณ์ราคาแพงด้วยตนเอง
            </p>
          </div>

          {/* Card 3: SDG 12 & 8 */}
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 hover:border-blue-500/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-2xl mb-6 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <i className="fa-solid fa-recycle"></i>
              </div>

              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase block mb-1">
                เป้าหมายการพัฒนาที่ยั่งยืน
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 flex items-baseline gap-2">
                <span>SDG 12 & 8</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-700/60 pt-4 mt-2 text-slate-300 text-sm">
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-check text-blue-400 text-xs mt-1"></i>
                <span className="text-xs text-slate-300">
                  <strong className="text-white">SDG 12:</strong> ลดการสร้างขยะอิเล็กทรอนิกส์ (E-waste) และส่งเสริมเศรษฐกิจหมุนเวียน
                </span>
              </div>
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-check text-blue-400 text-xs mt-1"></i>
                <span className="text-xs text-slate-300">
                  <strong className="text-white">SDG 8:</strong> ส่งเสริมการจ้างงานที่มีคุณค่าและสร้างรายได้แก่ช่างภาพอิสระ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
