import { ServerCrash, RefreshCw, Home, ArrowLeft, ShieldAlert, Terminal } from 'lucide-react';
import { useState } from 'react';
import SEOHead from '../components/SEOHead';
import { PageId } from '../types';

interface ServerErrorProps {
  onNavigate?: (page: PageId) => void;
  error?: Error;
  resetError?: () => void;
}

export default function ServerError({ onNavigate, error, resetError }: ServerErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleReload = () => {
    if (resetError) {
      resetError();
    }
    window.location.reload();
  };

  const handleGoHome = () => {
    if (resetError) {
      resetError();
    }
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.hash = '';
    }
  };

  const sampleErrorMessage = error?.message || 'Internal Server Error (500)';
  const sampleErrorStack = error?.stack || `Error: Failed to process local canvas dimensions
    at renderQRCode (qr-engine.ts:421:18)
    at handleStyleChange (generator.tsx:88:24)
    at dispatchEvent (react-dom.production.min.js:244:86)
    at triggerTransition (motion.ts:12:10)
    at HTMLButtonElement.onClick (button.tsx:44:9)`;

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-16 px-4" id="server-error-view">
      <SEOHead
        title="500 Internal Server Error - Quick QR Code"
        description="The server encountered an unexpected error or resource threshold while processing your request."
        path="/#/500"
      />

      <div className="max-w-xl w-full bg-white p-8 sm:p-12 rounded-3xl border border-red-100 shadow-xl text-center space-y-8 animate-fade-in" id="server-error-card">
        {/* Animated Error Indicator */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100/50 relative">
          <ServerCrash className="h-10 w-10 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[8px] font-bold text-white">!</span>
          </span>
        </div>

        {/* Heading Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200/50 px-3 py-1 text-[10px] font-mono uppercase font-bold text-red-800">
            <ShieldAlert className="h-3 w-3" />
            <span>Response Code: 500</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Unexpected Exception
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Our local browser-sandboxed systems ran into an unexpected memory allocation limit or a temporary javascript runtime conflict.
          </p>
        </div>

        {/* Detailed Diagnostics Area */}
        <div className="text-left bg-slate-900/95 rounded-2xl border border-slate-800 p-4.5 font-mono text-[11px] leading-relaxed shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              Diagnostics Log
            </span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition cursor-pointer"
            >
              {showDetails ? 'Hide Stack' : 'Show Stack'}
            </button>
          </div>
          <p className="text-rose-400 font-bold mb-1 break-words">
            STATUS_CODE_500: {sampleErrorMessage}
          </p>
          <p className="text-slate-500 text-[10px] mb-2">
            Timestamp: {new Date().toISOString()} • Environment: Production
          </p>
          {showDetails && (
            <pre className="text-slate-400 overflow-x-auto p-2 bg-slate-950/80 rounded-lg max-h-40 text-[10px] whitespace-pre border border-slate-800/50 scrollbar-thin">
              {sampleErrorStack}
            </pre>
          )}
        </div>

        {/* Troubleshooting Steps */}
        <div className="text-left bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
            🛠️ Recommended Recovery Steps:
          </h4>
          <ul className="list-decimal pl-4 text-[11px] text-slate-500 space-y-1.5">
            <li>
              <strong className="font-semibold text-slate-700">Clear Active Selection:</strong> Wipe customized parameters and try rendering a standard raw URL format.
            </li>
            <li>
              <strong className="font-semibold text-slate-700">Purge Browser Storage:</strong> Clean local variables or reset custom layout states in your preferences.
            </li>
            <li>
              <strong className="font-semibold text-slate-700">Reload Sandbox:</strong> Perform a hard refresh to reinitialize active canvas modules.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleReload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow hover:bg-slate-800 transition cursor-pointer"
            id="btn-500-retry"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Sandbox
          </button>
          
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer border border-slate-200"
            id="btn-500-home"
          >
            <Home className="h-3.5 w-3.5" />
            Return to Generator
          </button>
        </div>
      </div>
    </div>
  );
}
