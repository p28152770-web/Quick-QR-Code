import { AlertCircle, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { PageId } from '../types';

interface NotFoundProps {
  onNavigate: (page: PageId) => void;
}

export default function NotFound({ onNavigate }: NotFoundProps) {
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-16 px-4" id="not-found-view">
      <SEOHead
        title="404 Page Not Found - Quick QR Code"
        description="The requested page was not found on Quick QR Code."
        path="/#/404"
      />

      <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-md text-center space-y-6" id="not-found-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 animate-bounce">
          <AlertCircle className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-4xl font-extrabold text-slate-900">
            404
          </h2>
          <h3 className="font-display text-lg font-bold text-slate-800">
            Page Not Found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            The page you are looking for might have been moved, deleted, or has a temporary url typo.
          </p>
        </div>

        <button
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow hover:bg-sky-500 transition cursor-pointer"
          id="btn-404-home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Generator
        </button>
      </div>
    </div>
  );
}
