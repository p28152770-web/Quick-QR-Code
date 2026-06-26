import { useState, useEffect } from 'react';
import { PageId } from './types';
import Header from './components/Header';
import Footer from './components/Footer';

// Page Imports
import Home from './pages/Home';
import QRScanner from './pages/QRScanner';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Disclaimer from './pages/Disclaimer';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  // Map route hashes to specific PageIDs
  const parsePageFromHash = (hash: string): PageId => {
    const cleanHash = hash.replace(/^#\/?/, '').trim();
    if (!cleanHash) return 'home';

    switch (cleanHash) {
      case 'scanner':
      case 'qr-scanner':
        return 'scanner';
      case 'about':
        return 'about';
      case 'contact':
        return 'contact';
      case 'privacy':
        return 'privacy';
      case 'terms':
        return 'terms';
      case 'disclaimer':
        return 'disclaimer';
      case '500':
      case 'error-500':
        return '500';
      case '404':
        return '404';
      default:
        return '404';
    }
  };

  // Sync routing state on initialization and hash change
  useEffect(() => {
    const initialPage = parsePageFromHash(window.location.hash);
    setCurrentPage(initialPage);

    const handleHashChange = () => {
      const activePage = parsePageFromHash(window.location.hash);
      setCurrentPage(activePage);
      window.scrollTo(0, 0); // Scroll to top instantly
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update URL hash on page navigation
  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : `#/${page}`;
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans" id="app-wrapper">
        {/* Dynamic Header */}
        <Header currentPage={currentPage} onNavigate={handleNavigate} />

        {/* Main Page Content Body */}
        <main className="flex-grow" id="app-main-content">
          {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
          {currentPage === 'scanner' && <QRScanner onNavigate={handleNavigate} />}
          {currentPage === 'about' && <AboutUs onNavigate={handleNavigate} />}
          {currentPage === 'contact' && <ContactUs />}
          {currentPage === 'privacy' && <PrivacyPolicy />}
          {currentPage === 'terms' && <TermsConditions />}
          {currentPage === 'disclaimer' && <Disclaimer />}
          {currentPage === '500' && <ServerError onNavigate={handleNavigate} />}
          {currentPage === '404' && <NotFound onNavigate={handleNavigate} />}
        </main>

        {/* Footer */}
        <Footer onNavigate={handleNavigate} />
      </div>
    </ErrorBoundary>
  );
}
