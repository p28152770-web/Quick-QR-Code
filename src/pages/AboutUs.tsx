import { Shield, Sparkles, Zap, Heart, Terminal } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { PageId } from '../types';

interface AboutUsProps {
  onNavigate: (page: PageId) => void;
}

export default function AboutUs({ onNavigate }: AboutUsProps) {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8" id="about-view">
      <SEOHead
        title="About Us - Quick QR Code"
        description="Learn more about Quick QR Code, a fast, secure, browser-based QR code generator. Built with user privacy and speed in mind."
        path="/#/about"
      />

      <div className="mx-auto max-w-3xl bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm" id="about-card">
        {/* Breadcrumb / Category */}
        <div className="text-xs font-mono font-bold tracking-wider text-sky-500 uppercase mb-3">
          Behind the platform
        </div>

        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
          About Quick QR Code
        </h2>

        <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-6">
          <p>
            Welcome to <strong>Quick QR Code</strong> (quickqrcode.pages.dev), your premier browser utility for creating instant, high-quality, non-expiring QR codes and decoding them in real-time. We believe that critical daily productivity tools should be <strong>completely free, fast, secure, and accessible to everyone</strong> without wading through aggressive ad subscription loops, cookie walls, or profile registrations.
          </p>

          <p>
            Quick QR Code was founded in 2026 to dismantle the artificial boundaries set up by corporate converters that enforce scan limits, load heavy trackers onto your phone, or watermark your assets. We built this platform from the ground up as a pure client-side application featuring two highly optimized utilities:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                <span className="text-lg">⚙️</span> QR Code Generator
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create static QR codes for multiple categories (URLs, Wi-Fi networks, Location coordinates, email/SMS message templates, vCards, or raw text) with full control over foreground/background colors, size, and error correction levels. Everything is rendered inside your browser instantly with zero server interactions.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
                <span className="text-lg">🔍</span> QR Code Scanner
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Decode QR code patterns directly from a live web camera stream or by uploading standard image files (PNG, JPG, WEBP). Operating strictly via client-side processing, our scanner delivers rapid parsing of complex QR formats without logging your files or recording video streams.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-sky-400 bg-sky-50/50 p-4 rounded-r-xl my-8">
            <h4 className="font-display font-bold text-slate-900 text-sm mb-1">Our Core Commitment to You</h4>
            <p className="text-xs text-slate-600">
              We never save, inspect, or log your inputs or uploaded files on any remote server. All rendering, scanning, parsing, coloring, and final PNG vector assemblies are calculated locally within active runtime frames inside your visitor browser.
            </p>
          </div>

          <h3 className="font-display text-lg font-bold text-slate-900 mt-8 mb-4">
            Our Architectural Core Values
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6" id="about-values">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4.5 w-4.5 text-emerald-600" />
                <h4 className="font-display font-bold text-slate-900 text-sm">Absolute Client Privacy</h4>
              </div>
              <p className="text-xs text-slate-500">
                Data privacy is a basic human right. Since your inputs and scanned camera frames are processed locally, your sensitive information remains securely yours.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4.5 w-4.5 text-amber-500" />
                <h4 className="font-display font-bold text-slate-900 text-sm">Instant Execution</h4>
              </div>
              <p className="text-xs text-slate-500">
                No latency or heavy script loads. The platform features lightweight React modules and immediate client-side math calculations for both scanner and generator tools.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                <h4 className="font-display font-bold text-slate-900 text-sm">Permanent Scannability</h4>
              </div>
              <p className="text-xs text-slate-500">
                We generate valid, static, non-expiring QR images following ISO/IEC 18004 standards. They never decay, require server links, or trigger network redirects.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-4.5 w-4.5 text-sky-500" />
                <h4 className="font-display font-bold text-slate-900 text-sm">Open Web Integrity</h4>
              </div>
              <p className="text-xs text-slate-500">
                We operate with complete clarity. Our tools are built with open-source rendering engines, making them safe for businesses, education networks, and developers.
              </p>
            </div>
          </div>

          <h3 className="font-display text-lg font-bold text-slate-900 mt-8 mb-4">
            How It is Managed For Free
          </h3>
          <p>
            By executing all drawing math and image scanning processes directly inside your browser container, we consume virtually zero cloud server compute resources. This allows us to offer both our QR Code Generator and QR Code Scanner completely free of charge! We keep our setup clean, fast, and highly reliable.
          </p>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  const el = document.getElementById('generator-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-sky-500 transition cursor-pointer"
              id="about-cta-gen"
            >
              Start Generating for Free
            </button>
            <div className="text-slate-400 text-xs flex items-center gap-1">
              Made with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> by Open Web Pioneers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
