import SEOHead from '../components/SEOHead';

export default function Disclaimer() {
  const lastUpdated = "June 23, 2026";

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8" id="disclaimer-view">
      <SEOHead
        title="Legal Disclaimer - Quick QR Code"
        description="Read the official legal disclaimers and warranty details for Quick QR Code generator."
        path="/#/disclaimer"
      />

      <div className="mx-auto max-w-3xl bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm" id="disclaimer-card">
        <div className="text-xs font-mono font-bold tracking-wider text-sky-500 uppercase mb-3">
          Warranties & Disclaimers
        </div>

        <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-2">
          Legal Disclaimer
        </h2>
        <p className="text-xs text-slate-400 font-mono">Last Updated: {lastUpdated}</p>

        <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-6 mt-8">
          <p>
            The information and software services provided on <strong>Quick QR Code</strong> (quickqrcode.pages.dev) are intended strictly as a client-side productivity utility. Please review the following legal disclosures.
          </p>

          {/* SECTION 1: NO WARRANTY */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            1. Software Representation Disclaimer
          </h3>
          <p>
            The QR Code generation software and visual templates are provided on an <strong>&quot;AS IS&quot;</strong> basis. Quick QR Code makes no warranties, representation, or guarantees of any kind, whether express, statutory, or implied, regarding:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The absolute scannability of generated codes on all models of smartphone lenses or custom barcode readers.</li>
            <li>The uninterrupted availability of our web server endpoints hosted on Cloudflare Pages.</li>
            <li>The pixel compatibility of generated color hex codes with printing ink systems (such as CMYK offsets).</li>
          </ul>

          {/* SECTION 2: NO RESPONSIBILITY FOR LINK DESTINATIONS */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            2. Destination Content Disclaimer
          </h3>
          <p>
            Since Quick QR Code functions strictly as an un-monitored client tool, we store no links and exert <strong>no control over the destination websites, phone numbers, or WiFi passwords that users write into the patterns.</strong> 
          </p>
          <p>
            We are not responsible or liable for any redirect locations, phish, scam scripts, or malicious content associated with external QR patterns generated using our tools. Viewing or scanning any QR code distributed in wild environments is done fully at your own risk.
          </p>

          {/* SECTION 3: PRINT QUALITY WARNING */}
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100/60 my-6">
            <h4 className="font-display font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
              ⚠️ Physical Print Quality Warning
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              When printing QR codes on commercial scale layouts (menus, flyers, vehicle wraps, t-shirts), check your print contrast ratio. Low contrast patterns (such as light gray or yellow modules on soft white backgrounds) are often un-scannable under realistic conditions. 
            </p>
            <p className="text-xs text-slate-600 mt-2">
              We strongly advise downloading our <strong>&quot;Large&quot; (650px) preset</strong> and executing small-scale test prints using normal mobile cameras before commencing volume print jobs.
            </p>
          </div>

          {/* SECTION 4: ADSENSE & COOKIES */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            3. Advertisement & Financial Disclosure
          </h3>
          <p>
            This website displays Google AdSense advertisements in designated spaces. These spots are loaded to defray hosting, deployment, and ongoing server monitoring fees. While the core tool is 100% cookie-free on our codebase, third-party marketing networks may utilize standard cookies on your computer browser to serve contextual product recommendations.
          </p>

          {/* SECTION 5: GOOGLE INTELLECTUAL */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-4">
            4. Brand Affiliations
          </h3>
          <p>
            &quot;Quick QR Code&quot; is fully independent and has no legal affiliation, endorsement, sponsorship, or strategic partnerships with Google LLC, Alphabet Inc., Apple Inc., or its subsidiaries. All product names, logos, and trademarks mentioned inside are the property of their respective owners.
          </p>
        </div>
      </div>
    </div>
  );
}
