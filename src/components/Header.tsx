import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Menu, X, ArrowUpRight } from 'lucide-react';
import { PageId } from '../types';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { label: string; page: PageId }[] = [
    { label: 'QR Generator', page: 'home' },
    { label: 'QR Scanner', page: 'scanner' },
    { label: 'About Us', page: 'about' },
    { label: 'Contact Us', page: 'contact' },
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div 
          onClick={() => handleNavClick('home')} 
          className="flex cursor-pointer items-center space-x-2.5 group"
          id="hdr-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 border border-indigo-100 bg-slate-50">
            <img 
              src="/logo.jpg" 
              alt="Quick QR Code Logo" 
              className="h-full w-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-slate-900">
              Quick QR Code
            </h1>
            <p className="hidden xs:block text-[10px] font-mono tracking-wide text-indigo-500 uppercase -mt-1 font-semibold select-none">
              Instant & Free
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1" id="hdr-nav-desktop">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50/60 text-indigo-700 border-b-2 border-indigo-600 rounded-b-none'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                id={`nav-item-${item.page}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center" id="hdr-cta-desktop">
          <button
            onClick={() => {
              handleNavClick('home');
              const element = document.getElementById('generator-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-700 hover:shadow-indigo-100/50 cursor-pointer"
            id="btn-nav-generate"
          >
            Create Free QR
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden" id="hdr-mobile-controls">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            aria-expanded="false"
            id="btn-mobile-menu"
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-slate-100 bg-white lg:hidden overflow-hidden"
            id="mobile-drawer"
          >
            <div className="space-y-1.5 px-4 pt-2 pb-6">
              {navItems.map((item) => {
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => handleNavClick(item.page)}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    id={`mobile-nav-item-${item.page}`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-4 border-t border-slate-100 px-4">
                <button
                  onClick={() => {
                    handleNavClick('home');
                    setTimeout(() => {
                      const element = document.getElementById('generator-section');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                  id="mobile-nav-cta"
                >
                  Create Free QR
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
