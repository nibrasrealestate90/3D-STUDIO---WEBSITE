'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRightIcon, CloseIcon, MenuIcon, SearchIcon } from '@/components/ui/icons';
import { useStore } from '@/context/StoreContext';
import { buildWhatsAppUrl } from '@/lib/storeLogic';
import { BrandLogo } from '../ui/BrandLogo';
import { WhatsAppIcon } from '../ui/WhatsAppButton';

export function Navbar() {
  const { settings } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/custom-print', label: 'Custom Prints' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Automatically close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menus on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMobileNav = (href: string) => {
    setMobileMenuOpen(false);
    if (pathname !== href) {
      router.push(href);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push('/shop');
    }
    setSearchOpen(false);
  };

  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hello ${settings.storeName}! I'd like to enquire about your 3D printed creations in Dubai.`
  );

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FCF2EC]/95 backdrop-blur-md border-b border-[#0D1B35]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <Link
            href="/"
            className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F45A00] rounded-lg"
            aria-label={`${settings.storeName} Home`}
          >
            <BrandLogo storeName={settings.storeName} logoStyle={settings.logoStyle} />
          </Link>

          {/* Desktop Nav */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#0D1B35]/80"
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors hover:text-[#F45A00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F45A00] ${
                    active ? 'text-[#0D1B35] font-semibold' : ''
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="navbarActiveIndicator"
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-[#F45A00] rounded-full"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Toggle search bar"
              aria-expanded={searchOpen}
              className="w-10 h-10 rounded-xl inline-flex items-center justify-center text-[#0D1B35] hover:bg-[#FCE3CB]/60 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-[#F45A00] cursor-pointer"
            >
              <SearchIcon className="w-5 h-5" aria-hidden="true" />
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5B] active:scale-95 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0" bubbleFill="#FFFFFF" glyphFill="#25D366" />
              <span>WhatsApp</span>
            </a>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden w-10 h-10 rounded-xl inline-flex items-center justify-center text-[#0D1B35] hover:bg-[#FCE3CB]/60 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-[#F45A00] cursor-pointer"
            >
              {mobileMenuOpen ? (
                <CloseIcon className="w-5 h-5" aria-hidden="true" />
              ) : (
                <MenuIcon className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden border-t border-[#0D1B35]/10 bg-white/95 px-4 py-3 sm:px-6"
            >
              <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <label htmlFor="navbar-search-input" className="sr-only">
                    Search catalogue
                  </label>
                  <input
                    id="navbar-search-input"
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search 3D creations, home decor, phone stands..."
                    className="w-full rounded-xl border border-[#0D1B35]/15 bg-[#FCF2EC]/40 py-2.5 pl-10 pr-4 text-sm text-[#0D1B35] placeholder-[#737373] focus:border-[#F45A00] focus:bg-white focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0D1B35] hover:bg-[#F45A00] text-white px-5 py-2.5 text-sm font-semibold press-feedback cursor-pointer"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="w-10 h-10 rounded-xl inline-flex items-center justify-center text-[#737373] hover:text-[#0D1B35] press-feedback cursor-pointer"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Navigation Side Drawer - OUTSIDE <header> to avoid backdrop-filter stacking context bugs */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden pointer-events-auto">
            {/* Dimmed backdrop (visible on tablet/desktop viewports) */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#0D1B35]/65 z-40"
              aria-hidden="true"
            />

            {/* Slide-over Sheet: full-width on mobile (< 640px), 360px drawer on tablet/desktop */}
            <motion.aside
              key="mobile-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              style={{ backgroundColor: '#FCF2EC' }}
              className="fixed inset-y-0 right-0 w-full sm:w-[360px] sm:max-w-[85vw] bg-[#FCF2EC] text-[#0D1B35] shadow-2xl border-l border-[#0D1B35]/15 flex flex-col justify-between p-6 z-50 overflow-y-auto isolate"
            >
              <div className="space-y-6">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#0D1B35]/10">
                  <div
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="cursor-pointer"
                  >
                    <BrandLogo storeName={settings.storeName} logoStyle={settings.logoStyle} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="w-11 h-11 rounded-xl inline-flex items-center justify-center text-[#0D1B35] hover:bg-[#FCE3CB]/60 active:scale-95 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F45A00]"
                  >
                    <CloseIcon className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav aria-label="Mobile navigation" className="flex flex-col space-y-2">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMobileNav(item.href);
                        }}
                        className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-all cursor-pointer ${
                          active
                            ? 'bg-[#F45A00] text-white font-semibold shadow-xs'
                            : 'text-[#0D1B35] hover:bg-[#FCE3CB]/60 active:scale-[0.98]'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronRightIcon
                          className={`w-4 h-4 transition-transform ${
                            active ? 'text-white' : 'text-[#737373]'
                          }`}
                        />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Footer */}
              <div className="pt-4 border-t border-[#0D1B35]/10 space-y-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5B] text-white px-4 py-3.5 text-sm font-semibold shadow-xs press-feedback cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 shrink-0" bubbleFill="#FFFFFF" glyphFill="#25D366" />
                  <span>Chat on WhatsApp</span>
                </a>

                <p className="text-[11px] text-[#737373] text-center font-medium">
                  3D Studio · Dubai, UAE
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
