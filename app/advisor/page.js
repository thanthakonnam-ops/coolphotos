'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartProvider';

const EXAMPLES = [
  'ถ่ายรับปริญญา งบ 3,000',
  'อยากถ่ายรูปสินค้าขายออนไลน์ งบ 6,000',
  'เช่ากล้องไปเที่ยว 2 วัน งบ 1,000',
  'งานแต่งงาน งบ 15,000',
];

const TYPE_LABEL = { gear: 'อุปกรณ์', photographer: 'ช่างภาพ', package: 'แพ็กเกจ' };

const WELCOME = {
  role: 'assistant',
  text: 'สวัสดีครับ ผมช่วยเลือกกล้อง ช่างภาพ หรือแพ็กเกจให้ได้ แม้ไม่มีความรู้เรื่องกล้องเลยก็ตาม บอกผมแค่ว่าจะถ่ายงานอะไร และมีงบประมาณเท่าไร',
};

function RecommendationCard({ item, onAdd }) {
  return (
    <div className="flex gap-3 bg-slate-900/70 border border-slate-700 rounded-xl p-3">
      <img
        src={item.image}
        alt={item.name}
        className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0 bg-slate-800"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5 sm:gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-400">
              {TYPE_LABEL[item.type]}
            </span>
            <p className="font-semibold text-white text-sm leading-snug">{item.name}</p>
          </div>
          <div className="sm:text-right flex-shrink-0 flex items-baseline gap-2 sm:block">
            <p className="text-orange-400 font-bold text-sm">฿{item.total.toLocaleString('th-TH')}</p>
            <p className="text-[11px] text-slate-500">
              ฿{item.price.toLocaleString('th-TH')} / {item.unit}
            </p>
          </div>
        </div>
        {item.reason && <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{item.reason}</p>}
        <div className="flex gap-2 mt-2.5">
          <button
            onClick={() => onAdd(item)}
            className="text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition whitespace-nowrap"
          >
            <i className="fa-solid fa-cart-plus mr-1"></i>ใส่ตะกร้า
          </button>
          <Link
            href={item.href}
            className="text-xs font-semibold border border-slate-600 hover:border-orange-500 text-slate-200 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
          >
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (messages.length > 1) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const ask = async (text) => {
    const message = text.trim();
    if (!message || loading) return;
    const history = messages.slice(1).map(({ role, text }) => ({ role, text }));
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ระบบแนะนำขัดข้อง');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply, items: data.recommendations, mode: data.mode },
      ]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', text: e.message, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item) =>
    addToCart({
      id: item.id,
      type: item.type,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      category: item.category,
    });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-grow py-10 px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <i className="fa-solid fa-wand-magic-sparkles text-orange-500"></i>
            ผู้ช่วยเลือกกล้อง & ช่างภาพ
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            ไม่รู้จะเลือกอะไร? บอกงานที่อยากถ่ายและงบประมาณ ผู้ช่วยจะแนะนำจากสินค้าและช่างภาพที่มีในร้านจริง
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex gap-3'}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                </div>
              )}
              <div className={m.role === 'user' ? 'max-w-[85%]' : 'flex-1 min-w-0 space-y-3'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'bg-orange-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm'
                      : `text-sm leading-relaxed ${m.error ? 'text-red-300' : 'text-slate-200'}`
                  }
                >
                  {m.text}
                </div>
                {m.items?.length > 0 && (
                  <div className="space-y-2">
                    {m.items.map((item) => (
                      <RecommendationCard key={item.id} item={item} onAdd={handleAdd} />
                    ))}
                  </div>
                )}
                {m.mode && (
                  <p className="text-[10px] text-slate-500">
                    {m.mode === 'ai' ? 'แนะนำโดย AI (Gemini) จากข้อมูลสินค้าในร้าน' : 'แนะนำอัตโนมัติจากงบและประเภทงาน'}
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-sm text-slate-400">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin text-xs"></i>
              </div>
              กำลังเลือกให้...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => ask(ex)}
                className="text-xs bg-slate-800 border border-slate-700 hover:border-orange-500 text-slate-300 px-3 py-1.5 rounded-full transition"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder='เช่น "ถ่ายรับปริญญา งบ 3,000"'
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-5 rounded-xl text-sm transition"
          >
            ถาม
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
