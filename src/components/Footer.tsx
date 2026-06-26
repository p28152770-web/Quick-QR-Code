import { QrCode, Shield, Check, Heart } from 'lucide-react';
import { PageId } from '../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900" id="main-footer">
      {/* Upper Info & Cookie Disclosure Panel */}
      <div className="border-b border-slate-900 bg-slate-900/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-center">
            {/* Direct Cookie Explanation Badge */}
            <div className="flex items-start space-x-3.5 bg-slate-900/60 p-4.5 rounded-xl border border-slate-800/80">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold text-white tracking-wide">
                  Zero Tracking & Cookie Disclosure
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Quick QR Code is premium-grade and **100% cookie-free**. We do not load any tracking identifiers or third-party behavioral cookies. All QR code generation is performed locally inside your browser on-the-fly.
                </p>
              </div>
            </div>

            {/* Privacy Promise */}
            <div className="flex items-start space-x-3.5 bg-slate-900/60 p-4.5 rounded-xl border border-slate-800/80">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-semibold text-white tracking-wide">
                  100% Server Privacy Guarantee
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Because we execute calculations strictly client-side, your input texts, passwords, phone numbers, and URLs never touch our servers. Your data belongs only to you.
                </p>
              </div>
            </div>

            {/* AdSense Ready Spacer */}
            <div className="flex flex-col items-center md:items-end justify-center rounded-xl p-4.5 text-center md:text-right">
              <p className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">
                AdSense Compliant & Trust Verified
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                SSL Secured | Compliant with CCPA, GDPR, and PECR cookie regulations worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2.5 cursor-pointer group" onClick={() => handleNavClick('home')}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden border border-slate-800 bg-slate-900 transition duration-300 group-hover:scale-105">
                <img 
                  src="/logo.jpg" 
                  alt="Quick QR Code Logo" 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display text-base font-bold text-white tracking-tight group-hover:text-indigo-400 transition">
                Quick QR Code
              </span>
            </div>
            <p className="mt-4 text-sm max-w-md leading-relaxed text-slate-400">
              The premier free online QR generator designed with privacy and speed at its core. Generate instantly downloadable high-density QR codes without watermark, subscriptions, or log-in walls.
            </p>
            <div className="mt-6 flex space-x-4">
              <span className="text-xs font-mono text-slate-600 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
                quickqrcode.pages.dev
              </span>
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              QR Tools
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-white transition duration-200 text-left">
                  QR Code Generator
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('scanner')} className="hover:text-indigo-400 font-medium text-indigo-500 transition duration-200 text-left flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  QR Code Scanner
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-white transition duration-200 text-left">
                  WiFi Credential QR Code
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-white transition duration-200 text-left">
                  Phone & SMS QR Code
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-white transition duration-200 text-left">
                  Email Address QR Code
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNavClick('privacy')} className="hover:text-white transition duration-200 text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('terms')} className="hover:text-white transition duration-200 text-left">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('disclaimer')} className="hover:text-white transition duration-200 text-left">
                  Legal Disclaimer
                </button>
              </li>
            </ul>
          </div>

          {/* About & Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Overview
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleNavClick('about')} className="hover:text-white transition duration-200 text-left">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('contact')} className="hover:text-white transition duration-200 text-left">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower copyright bar */}
        <div className="mt-12 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} Quick QR Code. All rights reserved. Deployed via Cloudflare Pages.
          </p>
          <p className="text-xs text-slate-600 inline-flex items-center gap-1.5 font-mono">
            Crafted with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for instant browsing.
          </p>
        </div>
      </div>
    </footer>
  );
}
