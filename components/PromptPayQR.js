'use client';

import React, { useState, useEffect } from 'react';

// Shows the PromptPay QR for an order. Amount and QR come from /api/payment.
export default function PromptPayQR({ orderRef }) {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/payment?ref=${encodeURIComponent(orderRef)}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setPayment(data);
        else setError(data.error || 'ไม่สามารถสร้าง QR ชำระเงินได้');
      } catch (err) {
        console.error('Payment QR error:', err);
        if (!cancelled) setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [orderRef]);

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left">
        <i className="fa-solid fa-circle-info mr-1.5"></i>
        {error}
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="py-10 text-center text-slate-400 text-sm">
        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
        กำลังสร้าง QR ชำระเงิน...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 text-slate-900 text-center">
      <p className="text-xs font-bold text-blue-900 mb-2">
        <i className="fa-solid fa-qrcode mr-1"></i> PromptPay
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, nothing for next/image to optimise */}
      <img src={payment.qr} alt={`QR พร้อมเพย์ ยอด ${payment.amount} บาท`} className="w-52 h-52 mx-auto" />
      <p className="text-2xl font-extrabold mt-2">฿{payment.amount.toLocaleString()}</p>
      {payment.accountName && (
        <p className="text-xs text-slate-600">ชื่อบัญชี: {payment.accountName}</p>
      )}
      <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
        สแกนด้วยแอปธนาคารใดก็ได้ แล้วส่งสลิปพร้อมรหัสคำสั่งจอง{' '}
        <span className="font-mono font-bold text-slate-900">{payment.ref}</span> ทาง LINE{' '}
        <a href="https://line.me/ti/p/~theantn47" target="_blank" rel="noreferrer" className="text-blue-700 underline">
          theantn47
        </a>{' '}
        ทีมงานจะยืนยันคิวเมื่อตรวจสอบยอดเงินแล้ว
      </p>
    </div>
  );
}
