'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from './CartProvider';

export default function Header() {
  const { data: session, status } = useSession();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change or ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/#rental', label: 'เช่ากล้อง & เลนส์', icon: 'fa-camera' },
    { href: '/#photographers', label: 'จองคิวช่างภาพ', icon: 'fa-user-tie' },
    { href: '/#packages', label: 'แพ็กเกจสุดคุ้ม', icon: 'fa-box-open' },
    {
      href: '/#sdg',
      label: 'แนวคิดความยั่งยืน (SDG)',
      icon: 'fa-leaf',
      special: true,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 font-sans ${
        scrolled
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-slate-800'
          : 'bg-slate-900/90 backdrop-blur-sm border-b border-slate-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-sm shadow-orange-500/20">
              <i className="fa-solid fa-camera-retro text-xl"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">
                Cool photos
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 hidden sm:block">
                Camera Rental & Photographers
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  link.special
                    ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {link.special && (
                  <i className={`fa-solid ${link.icon} text-xs text-emerald-400`}></i>
                )}
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Shopping Cart"
            >
              <i className="fa-solid fa-bag-shopping text-xl"></i>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop Auth / User Menu */}
            <div className="hidden md:block">
              {status === 'loading' ? (
                <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse border border-slate-700"></div>
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-800 border border-slate-700/60 transition"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-orange-500/40"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                        {session.user?.name
                          ? session.user.name.charAt(0).toUpperCase()
                          : 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                      {session.user?.name || 'บัญชีของฉัน'}
                    </span>
                    <i
                      className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`}
                    ></i>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-700/80">
                        <p className="text-xs text-slate-400">เข้าสู่ระบบในชื่อ</p>
                        <p className="text-sm font-semibold text-white truncate">
                          {session.user?.name || 'ผู้ใช้งาน'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        {session.user?.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-orange-300 hover:bg-slate-700/60 hover:text-white transition"
                          >
                            <i className="fa-solid fa-clipboard-check text-orange-400 w-4"></i>
                            <span>จัดการการจอง (แอดมิน)</span>
                          </Link>
                        )}
                        <Link
                          href="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/60 hover:text-white transition"
                        >
                          <i className="fa-solid fa-receipt text-slate-400 w-4"></i>
                          <span>ประวัติการเช่า & จองคิว</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-700/80 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut();
                          }}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                        >
                          <i className="fa-solid fa-right-from-bracket w-4"></i>
                          <span>ออกจากระบบ</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <i className="fa-regular fa-user text-xs"></i>
                  <span>เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Open Mobile Menu"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Overlay Menu */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />

        {/* Slide-out Drawer */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
                  <i className="fa-solid fa-camera-retro text-lg"></i>
                </div>
                <span className="text-lg font-bold text-white">Cool photos</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
                aria-label="Close Mobile Menu"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* User Info (Mobile) */}
            {session && (
              <div className="py-4 my-2 px-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center gap-3">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover border border-orange-500"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                    {session.user?.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">
                    {session.user?.name || 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="mt-6 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition ${
                    link.special
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <i
                    className={`fa-solid ${link.icon} w-5 text-center ${
                      link.special ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  ></i>
                  <span>{link.label}</span>
                </a>
              ))}

              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-bag-shopping w-5 text-center text-slate-400"></i>
                  <span>ตะกร้าสินค้า</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {session && (
                <Link
                  href="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
                >
                  <i className="fa-solid fa-receipt w-5 text-center text-slate-400"></i>
                  <span>ประวัติการเช่า & จองคิว</span>
                </Link>
              )}

              {session?.user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-orange-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <i className="fa-solid fa-clipboard-check w-5 text-center text-orange-400"></i>
                  <span>จัดการการจอง (แอดมิน)</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Drawer Footer Auth Button */}
          <div className="pt-6 border-t border-slate-800">
            {session ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="w-full py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center gap-2 transition"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition"
              >
                <i className="fa-regular fa-user"></i>
                <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
