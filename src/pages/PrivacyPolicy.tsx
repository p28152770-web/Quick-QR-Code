import SEOHead from '../components/SEOHead';

export default function PrivacyPolicy() {
  const lastUpdated = "June 23, 2026";

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8" id="privacy-view">
      <SEOHead
        title="Privacy Policy - Quick QR Code"
        description="Read our comprehensive privacy policy. Discover how we protect your personal credentials with our 100% browser-local QR Code Generator."
        path="/#/privacy"
      />

      <div className="mx-auto max-w-3xl bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-sm" id="privacy-card">
        <div className="text-xs font-mono font-bold tracking-wider text-sky-500 uppercase mb-3">
          Compliance & Protection
        </div>

        <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-2">
          Privacy Policy
        </h2>
        <p className="text-xs text-slate-400 font-mono">Last Updated: {lastUpdated}</p>

        <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-6 mt-8">
          <p>
            Welcome to <strong>Quick QR Code</strong> (accessible via quickqrcode.pages.dev). Protecting your privacy, securing your digital assets, and providing transparent policies about our tools is our highest commitment. This Privacy Policy details the policies, procedures, and processing models for our key services: the <strong>QR Code Generator</strong> and the <strong>QR Code Scanner</strong>.
          </p>

          {/* SECTION 1: SERVICES DESCRIPTION & LOCAL DATA PROCESSING */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            1. Scope of Services & Local Data Processing
          </h3>
          <p>
            Quick QR Code is a privacy-first web platform. We run all processing logic directly in your browser client-side, which guarantees that your sensitive parameters never reach external cloud servers.
          </p>
          
          <div className="space-y-4 my-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
                <span className="text-sm">⚙️</span> QR Code Generator
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Our <strong>QR Code Generator</strong> allows you to design and customize QR codes for URLs, WiFi networks, phone numbers, contacts (vCards), coordinate locations, messaging drafts, and raw text. The generation math, vector calculation, style overrides, and logo overlay procedures are computed entirely within your local browser. Your passwords, contact details, or destination links are never uploaded, stored, or indexed on any remote database.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-display font-bold text-slate-800 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
                <span className="text-sm">🔍</span> QR Code Scanner
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Our <strong>QR Code Scanner</strong> decodes barcode formats in real-time. Whether you choose to capture barcodes via your device's live camera or upload a static file, all decoding activities happen directly on your CPU/GPU using sandboxed scripts (such as <code>jsQR</code>). 
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-400">
                <li><strong>Camera Stream Security:</strong> When you grant camera access, the video feed is processed frame-by-frame locally. It is never recorded, transmitted, or streamed online.</li>
                <li><strong>Local File Scanning:</strong> Uploaded images are rendered onto a local canvas object to extract pixel values and decode information instantly. No images are uploaded to any server.</li>
              </ul>
            </div>
          </div>

          {/* SECTION 2: THE PERFECT COOKIE EXPLANATION */}
          <div className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100/50 my-6">
            <h3 className="font-display text-base font-bold text-slate-900 mb-2">
              2. Cookie & Browser Storage Disclosure
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              We maintain absolute transparency regarding web cookies, web storage, and third-party advertising files:
            </p>
            
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 uppercase font-mono">What are Cookies?</h4>
                <p className="text-slate-500 mt-1">
                  Cookies are small data files containing alpha-numeric tokens that websites place on your device to remember user preferences, facilitate logins, analyze site navigation traffic patterns, or deliver customized advertising campaigns.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase font-mono">First-Party & Analytical Cookies</h4>
                <p className="text-slate-500 mt-1">
                  <strong>Quick QR Code does not deploy any first-party cookies, tracking beacons, or telemetry scripts.</strong> We do not monitor your click patterns, map your user journey, or analyze your activities on our platform. Your interaction is 100% private and unmonitored.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase font-mono">Third-Party Advertising & AdSense Cookies</h4>
                <p className="text-slate-500 mt-1">
                  To sustain our free open web service, we serve programmatic advertisements through networks like <strong>Google AdSense</strong>. Google, as a third-party vendor, uses cookies (including the DoubleClick DART cookie) to serve ads based on your visit history on this website and other domains across the Internet. 
                </p>
                <p className="text-slate-500 mt-1">
                  You can opt out of personalized third-party ad targeting by visiting the Google Ads Settings page or setting up do-not-track directives in your browser.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase font-mono">In-Browser LocalStorage</h4>
                <p className="text-slate-500 mt-1">
                  We use the browser's sandboxed <strong>localStorage</strong> API solely to store user convenience preferences locally. This includes remembering your customized design colors (foreground and background), selected layout settings, and a history of recently scanned items in your QR Code Scanner. This data resides entirely on your device, is never transmitted to our network, and can be cleared instantly by wiping your browser's application cache.
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-sky-200/50 text-[11px] text-slate-500">
                ⚡ <strong>Compliance Notice:</strong> Since we do not process first-party tracking cookies or store any personally identifiable information (PII) on our servers, we fully respect all global GDPR, CCPA, and CPRA privacy directives without requiring invasive, slow banner elements.
              </div>
            </div>
          </div>

          {/* SECTION 3: THIRD-PARTY ANALYTICS & ADSENSE */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            3. Third-Party Service Providers & Network Logs
          </h3>
          <p>
            When you load our pages, our hosting partner (such as Cloudflare Pages) may process standard, technical internet logs (IP address, user agent strings, and timestamps) solely to defend against denial-of-service (DDoS) vectors and ensure stable networking. This metadata is stored securely, handled as transient info, and is never compiled with your customized QR code outputs.
          </p>

          {/* SECTION 4: GLOBAL REGULATORY COMPLIANCE */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            4. GDPR, CCPA & CPRA Data Rights
          </h3>
          <p>
            Under European (GDPR) and Californian (CCPA/CPRA) laws, users have the right to inspect, edit, export, or delete any of their personal information. Since our QR Code Generator and QR Code Scanner process all data locally on your computer, <strong>we do not collect, hold, or transmit any of your personal records.</strong> There is no remote account structure or cloud database to wipe.
          </p>
          <p>
            If you contact us directly via email or our contact form, your email address is kept confidential and is deleted immediately upon request.
          </p>

          {/* SECTION 5: CHILDREN INFORMATION */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-2">
            5. Protection of Minors
          </h3>
          <p>
            We do not knowingly solicit, collect, or store data from children under the age of 13. Since our generators and scanners operate client-side, we do not require user signups, rendering our utility safe for educational environments and families alike.
          </p>

          {/* SECTION 6: AMENDMENTS */}
          <h3 className="font-display text-base font-bold text-slate-900 mt-8 mb-4">
            6. Policy Amendments
          </h3>
          <p>
            We may occasionally update this Privacy Policy to reflect advancements in browser security, camera stream APIs, or regulatory updates. We recommend checking this page to stay fully informed.
          </p>
        </div>
      </div>
    </div>
  );
}
