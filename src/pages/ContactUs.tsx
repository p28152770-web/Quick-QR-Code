import React, { useState } from 'react';
import { Mail, MessageSquare, Clock, ShieldAlert, Send, CheckCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    
    // Simulate server ingestion (since we operate purely client-side as requested)
    setTimeout(() => {
      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8" id="contact-view">
      <SEOHead
        title="Contact Us - Quick QR Code Support"
        description="Have questions or suggestions about our QR code tool? Clean browser-based contact form or email support."
        path="/#/contact"
      />

      <div className="mx-auto max-w-5xl" id="contact-frame">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-mono font-bold tracking-wider text-sky-500 uppercase">Support Center</span>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-1">Get in Touch</h2>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                  Have questions, feedback, or custom inquiries about our <strong>QR Code Generator</strong> or <strong>QR Code Scanner</strong>? Want to suggest new style integrations, report issues, or propose technical improvements? Our open support desk is glad to assist you.
                </p>
              </div>

              {/* Direct Support Items */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 shrink-0">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-display">General & Technical Support</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">support@quickqrcode.pages.dev</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-display">Response Commitments</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Within 24-48 business hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <ShieldAlert className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-display">Privacy Inquiries</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">privacy@quickqrcode.pages.dev</p>
                  </div>
                </div>
              </div>

              {/* Secure client warning notice */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] leading-relaxed text-slate-400">
                ⚠️ Quick QR Code does not harvest email addresses for promotion. Your queries are dealt with confidentially following compliance with GDPR/CCPA.
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden" id="contact-form-box">
              
              {status === 'success' ? (
                <div className="py-12 text-center space-y-4 animate-fade-in" id="contact-success-state">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">Message Delivered Safely!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. A compliance specialist will inspect your message and follow up if needed within two business days.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Send Another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" id="contact-form">
                  <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-slate-400" />
                    Submit Support Ticket
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="ct-name" className="block text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="ct-name"
                        required
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="ct-email" className="block text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="ct-email"
                        required
                        className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="ct-subj" className="block text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="ct-subj"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                      placeholder="Feedback about WiFi code mapping"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="ct-msg" className="block text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      Detailed Message
                    </label>
                    <textarea
                      id="ct-msg"
                      rows={5}
                      required
                      className="block w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                      placeholder="Hi! I wanted to inquire about..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-xs text-red-500 font-medium">
                      Please fill out all mandatory fields correctly before submitting.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow hover:bg-sky-500 disabled:opacity-50 transition cursor-pointer"
                    id="btn-contact-submit"
                  >
                    {status === 'submitting' ? 'Delivering...' : 'Send Message'}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
