import SEOHead from '../components/SEOHead';

export default function TermsConditions() {
  const lastUpdated = "June 23, 2026";

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8" id="terms-view">
      <SEOHead
        title="Terms & Conditions - Quick QR Code"
        description="Review the terms of service and usage regulations for Quick QR Code. Read about our free commercial terms."
        path="/#/terms"
      />

      <div className="mx-auto max-w-3xl bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm" id="terms-card">
        <div className="text-xs font-mono font-bold tracking-wider text-sky-500 uppercase mb-3">
          User Agreement
        </div>

        <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-2">
          Terms & Conditions
        </h2>
        <p className="text-xs text-slate-400 font-mono">Last Updated: {lastUpdated}</p>

        <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-6 mt-8">
          <p>
            Welcome to <strong>Quick QR Code</strong> (quickqrcode.pages.dev). These Terms and Conditions outline the rules, regulations, licenses, and guidelines governing your access to and use of our client-side software utilities, including our <strong>QR Code Generator</strong> and <strong>QR Code Scanner</strong>.
          </p>
          <p>
            By accessing and utilizing this website or any of its associated tool subsets, we assume you accept these terms in full. If you disagree with any portion of these provisions, you must immediately suspend use of our generator and scanning tools.
          </p>

          {/* SECTION 1: SERVICES DESCRIPTION */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            1. Description of Services & License Parameters
          </h3>
          <p>
            Quick QR Code provides a suite of local browser-based utilities:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>QR Code Generator:</strong> A client-side generator enabling you to input various metadata types (WiFi passwords, URLs, vCards, coordinate mappings) to synthesize standard static ISO/IEC 18004 barcodes.
            </li>
            <li>
              <strong>QR Code Scanner:</strong> An in-browser decoder that analyzes live webcam feeds or uploaded static image graphics (PNG, JPG, WEBP, etc.) to extract raw text content locally.
            </li>
          </ul>

          {/* SECTION 2: LICENSE */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            2. Free Commercial Use License
          </h3>
          <p>
            All intellectual rights and digital pixel layouts generated using the Quick QR Code generator belong solely to you, the creator. We grant you an <strong>unrestricted, perpetual, royalty-free, worldwide, and fully commercial license</strong> to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Print generated designs on merchandise, business cards, physical signage, menus, or product packagings.</li>
            <li>Incorporate vector QR codes in digital designs, publications, brochures, and media campaigns.</li>
            <li>Distribute generated QR codes without watermarks, mandatory attribution, or licensing fees.</li>
          </ul>

          {/* SECTION 3: RESPONSIBLE SCANS */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 my-6">
            <h3 className="font-display text-sm font-bold text-slate-900 mb-2">
              ⚠️ CRITICAL: Mandatory Pre-Print Scan Verification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Because Quick QR Code operates entirely client-side on your browser without manual admin intervention, <strong>you are strictly and solely responsible for testing and verifying all patterns before high-volume physical print runs.</strong>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Always test the final downloaded PNG design using multiple physical scanner devices (such as iOS Camera, Android lens, or specialized barcode scanning hardware) under realistic lighting. Quick QR Code is not responsible for catalog paper, printing, or distribution costs resulting from un-scannability, wrong destination links, input typos, or low-contrast configurations.
            </p>
          </div>

          {/* SECTION 4: PROHIBITED USE */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            3. Prohibited Behaviors & Safe Scanner Usage
          </h3>
          <p>
            When using our Generator or Scanner services, you agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Formulate QR codes that lead to illegal web phishing platforms, spyware downloads, or malicious data networks.</li>
            <li>Use the QR Code Scanner to decode data for malicious exploits or reverse-engineer private credentials.</li>
            <li>Attempt to break, overload, or reverse-engineer the client-side rendering package of quickqrcode.pages.dev.</li>
          </ul>

          {/* SECTION 5: NO WARRANTIES */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            4. Disclaimer of Warranties
          </h3>
          <p>
            Our software utilities are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranties of any kind, whether express or implied, including but not limited to merchantability, fitness for a specific purpose, or scannability guarantees on specialized camera hardware or low-light situations.
          </p>

          {/* SECTION 6: LIMITATION OF LIABILITY */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            5. Limitation of Liability
          </h3>
          <p>
            In no event shall Quick QR Code, its developers, or affiliates be held liable for any damages (including, without limitation, direct, indirect, incidental, special, or consequential damages, or loss of profits, business interruptions, or printed material losses) arising out of the use, scannability, decoding precision, or inability to scan/scan-decode our generated or processed files, even if advised beforehand of such possibilities.
          </p>

          {/* SECTION 7: INDEMNIFICATION */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            6. Indemnification
          </h3>
          <p>
            You agree to indemnify and hold harmless Quick QR Code and its technical developers against any and all claims, damages, liabilities, costs, or losses arising from your deployment of generated QR codes on physical products, web storefronts, or promotional campaigns.
          </p>

          {/* SECTION 8: GOVERNING LAW */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-4">
            7. Governing Regulations
          </h3>
          <p>
            These Terms shall be interpreted and governed in accordance with global common law principles, without reference to conflict of law statutes. Any disputes shall be dealt with exclusively through amicable direct support inquiries.
          </p>
        </div>
      </div>
    </div>
  );
}
