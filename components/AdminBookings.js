'use client';

import React, { useState } from 'react';
import { STATUS_TRANSITIONS } from '@/lib/admin-status';

const STATUS_LABELS = {
  PENDING: { label: 'รอยืนยัน', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  CONFIRMED: { label: 'ยืนยันแล้ว', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  COMPLETED: { label: 'เสร็จสิ้น', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  CANCELLED: { label: 'ยกเลิก', className: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

const ACTIONS = {
  CONFIRMED: { label: 'ยืนยันคิว', icon: 'fa-check', className: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  COMPLETED: { label: 'ส่งคืน/เสร็จสิ้น', icon: 'fa-flag-checkered', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
  CANCELLED: { label: 'ยกเลิก', icon: 'fa-xmark', className: 'bg-slate-700 hover:bg-red-500/80 text-slate-200 hover:text-white' },
};

const TYPE_LABELS = { GEAR: 'อุปกรณ์', PHOTOGRAPHER: 'ช่างภาพ', PACKAGE: 'แพ็กเกจ' };

const PAYMENT_LABELS = { promptpay: 'พร้อมเพย์', credit_card: 'บัตรเครดิต/เดบิต (ระบบเก่า)' };

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';

const formatBaht = (value) => `฿${Number(value || 0).toLocaleString()}`;

export default function AdminBookings({ initialBookings }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [error, setError] = useState('');

  const counts = bookings.reduce(
    (acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }),
    {}
  );
  const revenue = bookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const term = search.trim().toLowerCase();
  const visible = bookings.filter(
    (b) =>
      (filter === 'ALL' || b.status === filter) &&
      (!term ||
        [b.itemName, b.contactName, b.contactPhone, b.user?.email, b.id, b.orderRef]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(term)))
  );

  const changeStatus = async (id, status) => {
    setError('');
    setCancelConfirmId(null);
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'อัปเดตสถานะไม่สำเร็จ');
        return;
      }
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err) {
      console.error('Status update error:', err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setUpdatingId(null);
    }
  };

  const tabs = [
    { key: 'PENDING', label: 'รอยืนยัน' },
    { key: 'CONFIRMED', label: 'ยืนยันแล้ว' },
    { key: 'COMPLETED', label: 'เสร็จสิ้น' },
    { key: 'CANCELLED', label: 'ยกเลิก' },
    { key: 'ALL', label: 'ทั้งหมด' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <p className="text-xs text-slate-400">รอยืนยัน</p>
          <p className="text-2xl font-extrabold text-amber-400">{counts.PENDING || 0}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <p className="text-xs text-slate-400">ยืนยันแล้ว (กำลังดำเนินการ)</p>
          <p className="text-2xl font-extrabold text-emerald-400">{counts.CONFIRMED || 0}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <p className="text-xs text-slate-400">เสร็จสิ้น</p>
          <p className="text-2xl font-extrabold text-blue-400">{counts.COMPLETED || 0}</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <p className="text-xs text-slate-400">รายได้ (ยืนยัน + เสร็จสิ้น ไม่รวมมัดจำ)</p>
          <p className="text-2xl font-extrabold text-white">{formatBaht(revenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                filter === tab.key
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-70">
                {tab.key === 'ALL' ? bookings.length : counts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหารหัสคำสั่งจอง ชื่อลูกค้า เบอร์โทร หรืออีเมล"
          className="w-full md:w-80 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
        />
      </div>

      {filter === 'PENDING' && (counts.PENDING || 0) > 0 && (
        <p className="text-xs text-slate-400">
          <i className="fa-solid fa-circle-info mr-1.5"></i>
          กด &quot;ยืนยันคิว&quot; เมื่อได้รับสลิปและตรวจสอบยอดเงินเข้าบัญชีพร้อมเพย์แล้ว (จับคู่ด้วยรหัสคำสั่งจอง)
        </p>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>
          {error}
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">
          ไม่มีรายการจองในหมวดนี้
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((b) => {
            const status = STATUS_LABELS[b.status] || STATUS_LABELS.PENDING;
            const actions = STATUS_TRANSITIONS[b.status] || [];
            const busy = updatingId === b.id;

            return (
              <div
                key={b.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-3 gap-5"
              >
                {/* Booking */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${status.className}`}>
                      {status.label}
                    </span>
                    <span className="text-[11px] text-slate-400">{TYPE_LABELS[b.itemType] || b.itemType}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {b.itemName}
                    {b.quantity > 1 && <span className="text-slate-400 font-normal"> × {b.quantity}</span>}
                  </h3>
                  <p className="text-xs text-slate-400">
                    <i className="fa-regular fa-calendar mr-1.5"></i>
                    {formatDate(b.startDate)}
                    {b.endDate && b.endDate !== b.startDate && ` – ${formatDate(b.endDate)}`}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {b.orderRef ? `คำสั่งจอง ${b.orderRef}` : `#${b.id.slice(0, 10)}`} • จองเมื่อ {formatDate(b.createdAt)}
                  </p>
                </div>

                {/* Customer */}
                <div className="space-y-1 text-xs text-slate-300">
                  <p className="font-semibold text-white text-sm">{b.contactName || b.user?.name || '-'}</p>
                  {b.contactPhone && (
                    <p>
                      <i className="fa-solid fa-phone mr-1.5 text-slate-500"></i>
                      {b.contactPhone}
                    </p>
                  )}
                  <p>
                    <i className="fa-regular fa-envelope mr-1.5 text-slate-500"></i>
                    {b.contactEmail || b.user?.email}
                  </p>
                  {b.address && (
                    <p className="whitespace-pre-line">
                      <i className="fa-solid fa-location-dot mr-1.5 text-slate-500"></i>
                      {b.address}
                    </p>
                  )}
                  {b.notes && (
                    <p className="text-slate-400 italic">
                      <i className="fa-regular fa-note-sticky mr-1.5 text-slate-500"></i>
                      {b.notes}
                    </p>
                  )}
                </div>

                {/* Money & actions */}
                <div className="flex flex-col lg:items-end justify-between gap-3">
                  <div className="lg:text-right text-xs text-slate-400 space-y-0.5">
                    <p>
                      ค่าเช่า/บริการ <span className="text-white font-semibold">{formatBaht(b.totalPrice)}</span>
                    </p>
                    <p>
                      มัดจำ <span className="text-white font-semibold">{formatBaht(b.deposit)}</span>
                    </p>
                    <p className="text-base font-extrabold text-orange-400">
                      {formatBaht(b.totalPrice + b.deposit)}
                    </p>
                    {b.paymentMethod && <p>ชำระผ่าน: {PAYMENT_LABELS[b.paymentMethod] || b.paymentMethod}</p>}
                  </div>

                  {actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {cancelConfirmId === b.id ? (
                        <>
                          <span className="text-xs text-red-300 self-center">ยืนยันการยกเลิก?</span>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => changeStatus(b.id, 'CANCELLED')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                          >
                            ยกเลิกการจอง
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelConfirmId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-slate-200"
                          >
                            ไม่ใช่
                          </button>
                        </>
                      ) : (
                        actions.map((next) => {
                          const action = ACTIONS[next];
                          return (
                            <button
                              key={next}
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                next === 'CANCELLED' ? setCancelConfirmId(b.id) : changeStatus(b.id, next)
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${action.className}`}
                            >
                              <i className={`fa-solid ${busy ? 'fa-circle-notch fa-spin' : action.icon} mr-1.5`}></i>
                              {action.label}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
