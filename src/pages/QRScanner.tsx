import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Copy, 
  ExternalLink, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  QrCode, 
  Sparkles, 
  RefreshCw, 
  Info, 
  X, 
  ArrowLeftRight,
  Smartphone,
  ShieldAlert,
  Clock,
  ArrowRight,
  Zap,
  Wifi,
  Globe,
  Mail,
  Phone,
  User,
  MapPin,
  MessageSquare,
  FileText,
  Key,
  Eye,
  EyeOff,
  Lock,
  Check
} from 'lucide-react';
import jsQR from 'jsqr';
import { PageId } from '../types';
import SEOHead from '../components/SEOHead';

interface QRScannerProps {
  onNavigate: (page: PageId) => void;
}

interface ScanHistoryItem {
  id: string;
  content: string;
  timestamp: string;
  type: string;
}

export default function QRScanner({ onNavigate }: QRScannerProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('upload');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Specialized scanner mode and password toggles
  const [selectedScannerType, setSelectedScannerType] = useState<'auto' | 'wifi' | 'vcard' | 'url' | 'mail_sms' | 'geo'>('auto');
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  // Parsers interfaces
  interface ParsedWifi {
    ssid: string;
    password?: string;
    encryption?: string;
    hidden?: boolean;
  }

  interface ParsedContact {
    name: string;
    phone?: string;
    email?: string;
    url?: string;
    org?: string;
    title?: string;
    address?: string;
    note?: string;
  }

  interface ParsedSMS {
    phone: string;
    message?: string;
  }

  interface ParsedEmail {
    to: string;
    subject?: string;
    body?: string;
  }

  interface ParsedGeo {
    lat: string;
    lon: string;
    query?: string;
  }

  // Specialized Parser Functions
  const parseWifi = (raw: string): ParsedWifi | null => {
    if (!raw.toUpperCase().startsWith('WIFI:')) return null;
    const ssidMatch = raw.match(/S:((?:[^;]|\\;)*);/i);
    const passMatch = raw.match(/P:((?:[^;]|\\;)*);/i);
    const encMatch = raw.match(/T:((?:[^;]|\\;)*);/i);
    const hiddenMatch = raw.match(/H:(true|false|1|0);/i);

    const unescape = (str: string) => {
      if (!str) return '';
      return str.replace(/\\;/g, ';')
                .replace(/\\:/g, ':')
                .replace(/\\,/g, ',')
                .replace(/\\\\/g, '\\');
    };

    return {
      ssid: ssidMatch ? unescape(ssidMatch[1]) : 'Unknown Network',
      password: passMatch ? unescape(passMatch[1]) : '',
      encryption: encMatch ? unescape(encMatch[1]) : 'WPA',
      hidden: hiddenMatch ? (hiddenMatch[1].toLowerCase() === 'true' || hiddenMatch[1] === '1') : false
    };
  };

  const parseContact = (raw: string): ParsedContact | null => {
    const clean = raw.trim();
    if (clean.toUpperCase().startsWith('BEGIN:VCARD')) {
      const fnMatch = clean.match(/^FN:(.*)$/im);
      const nMatch = clean.match(/^N:(.*)$/im);
      const telMatch = clean.match(/^TEL(?:;[^:]*)?:(.*)$/im);
      const emailMatch = clean.match(/^EMAIL(?:;[^:]*)?:(.*)$/im);
      const urlMatch = clean.match(/^URL(?:;[^:]*)?:(.*)$/im);
      const orgMatch = clean.match(/^ORG:(.*)$/im);
      const titleMatch = clean.match(/^TITLE:(.*)$/im);
      const adrMatch = clean.match(/^ADR(?:;[^:]*)?:(.*)$/im);
      const noteMatch = clean.match(/^NOTE:(.*)$/im);

      let name = '';
      if (fnMatch) {
        name = fnMatch[1].trim();
      } else if (nMatch) {
        const parts = nMatch[1].split(';').map(p => p.trim());
        name = [parts[1], parts[0]].filter(Boolean).join(' ');
      }

      return {
        name: name || 'Unknown Contact',
        phone: telMatch ? telMatch[1].trim() : undefined,
        email: emailMatch ? emailMatch[1].trim() : undefined,
        url: urlMatch ? urlMatch[1].trim() : undefined,
        org: orgMatch ? orgMatch[1].replace(/;/g, ' ').trim() : undefined,
        title: titleMatch ? titleMatch[1].trim() : undefined,
        address: adrMatch ? adrMatch[1].replace(/;/g, ' ').trim() : undefined,
        note: noteMatch ? noteMatch[1].trim() : undefined
      };
    } else if (clean.toUpperCase().startsWith('MECARD:')) {
      const nMatch = clean.match(/N:((?:[^;]|\\;)*);/i);
      const telMatch = clean.match(/TEL:((?:[^;]|\\;)*);/i);
      const emailMatch = clean.match(/EMAIL:((?:[^;]|\\;)*);/i);
      const urlMatch = clean.match(/URL:((?:[^;]|\\;)*);/i);
      const adrMatch = clean.match(/ADR:((?:[^;]|\\;)*);/i);
      const noteMatch = clean.match(/NOTE:((?:[^;]|\\;)*);/i);

      let name = '';
      if (nMatch) {
        const parts = nMatch[1].split(',').map(p => p.trim());
        name = parts.reverse().join(' ');
      }

      return {
        name: name || 'Unknown Contact',
        phone: telMatch ? telMatch[1] : undefined,
        email: emailMatch ? emailMatch[1] : undefined,
        url: urlMatch ? urlMatch[1] : undefined,
        address: adrMatch ? adrMatch[1] : undefined,
        note: noteMatch ? noteMatch[1] : undefined
      };
    }
    return null;
  };

  const parseSMS = (raw: string): ParsedSMS | null => {
    const clean = raw.trim();
    if (clean.toUpperCase().startsWith('SMSTO:')) {
      const parts = clean.substring(6).split(':');
      return {
        phone: parts[0] || '',
        message: parts.slice(1).join(':')
      };
    } else if (clean.toUpperCase().startsWith('SMS:')) {
      const remainder = clean.substring(4);
      if (remainder.includes('?')) {
        const parts = remainder.split('?');
        const phone = parts[0];
        const bodyMatch = parts[1].match(/body=([^&]*)/i);
        return {
          phone,
          message: bodyMatch ? decodeURIComponent(bodyMatch[1]) : ''
        };
      } else {
        const parts = remainder.split(':');
        return {
          phone: parts[0] || '',
          message: parts.slice(1).join(':')
        };
      }
    }
    return null;
  };

  const parseEmail = (raw: string): ParsedEmail | null => {
    const clean = raw.trim();
    if (clean.toLowerCase().startsWith('mailto:')) {
      const parts = clean.substring(7).split('?');
      const to = parts[0];
      if (parts[1]) {
        const subjMatch = parts[1].match(/subject=([^&]*)/i);
        const bodyMatch = parts[1].match(/body=([^&]*)/i);
        return {
          to,
          subject: subjMatch ? decodeURIComponent(subjMatch[1]) : undefined,
          body: bodyMatch ? decodeURIComponent(bodyMatch[1]) : undefined
        };
      }
      return { to };
    }
    return null;
  };

  const parseGeo = (raw: string): ParsedGeo | null => {
    const clean = raw.trim();
    if (clean.toLowerCase().startsWith('geo:')) {
      const parts = clean.substring(4).split('?');
      const coords = parts[0].split(',');
      const qMatch = parts[1]?.match(/q=([^&]*)/i);
      return {
        lat: coords[0] || '0',
        lon: coords[1] || '0',
        query: qMatch ? decodeURIComponent(qMatch[1]) : undefined
      };
    }
    return null;
  };

  // Helper to compile and trigger a vCard download (.vcf file)
  const triggerVCardDownload = (contact: ParsedContact) => {
    const vcardContent = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.name}`,
      contact.phone ? `TEL;TYPE=CELL:${contact.phone}` : '',
      contact.email ? `EMAIL;TYPE=PREF,INTERNET:${contact.email}` : '',
      contact.org ? `ORG:${contact.org}` : '',
      contact.title ? `TITLE:${contact.title}` : '',
      contact.url ? `URL:${contact.url}` : '',
      contact.address ? `ADR;TYPE=WORK:;;${contact.address};;;` : '',
      contact.note ? `NOTE:${contact.note}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contact.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Pre-configured testing templates/samples to let the user easily experience the decoders in-preview!
  const TEST_TEMPLATES = {
    wifi: 'WIFI:T:WPA;S:Home_Network_Secure;P:SuperSecretPass123;;',
    vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Google DeepMind;Antigravity Team\nTITLE:Lead AI Engineer\nTEL;TYPE=CELL,VOICE:+1 (555) 019-2834\nEMAIL;TYPE=PREF,INTERNET:johndoe@deepmind.ai\nURL:https://ai.google/research\nADR;TYPE=WORK:;;600 Amphitheatre Pkwy;Mountain View;CA;94043;USA\nNOTE:Pioneering next-generation agent frameworks!\nEND:VCARD',
    url: 'https://github.com/google/generative-ai-js',
    mail_sms: 'mailto:support@google.com?subject=Quick%20QR%20Code%20Feedback&body=Hello%20Team,%0A%0AI%20absolutely%20love%20the%20new%20specialized%20QR%20scanners!',
    geo: 'geo:37.4220,-122.0841?q=Googleplex'
  };

  const loadTestSample = (type: keyof typeof TEST_TEMPLATES) => {
    const sample = TEST_TEMPLATES[type];
    setScanResult(sample);
    saveToHistory(sample);
    setSelectedScannerType(type);
    setScanError(null);
  };

  // Camera scanning states
  const [cameraActive, setCameraActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Upload state
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);

  // Scan History
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // SEO Schema
  const scannerPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Free QR Code Scanner Online",
    "url": "https://quickqrcode.pages.dev/#/qr-scanner",
    "description": "Scan QR codes in real-time using your device camera or upload image files (PNG, JPG, WEBP). Simple, secure, and entirely browser-based.",
    "applicationCategory": "Utility",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5 Camera access and JavaScript support"
  };

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quickqr_scan_history');
      if (saved) {
        setScanHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load scan history", e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (content: string) => {
    if (!content.trim()) return;
    
    // Check for duplicate recent entry
    setScanHistory(prev => {
      const filtered = prev.filter(item => item.content !== content);
      const isUrl = content.trim().startsWith('http://') || content.trim().startsWith('https://');
      const newItem: ScanHistoryItem = {
        id: Date.now().toString(),
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: isUrl ? 'URL' : 'Text'
      };
      const updated = [newItem, ...filtered].slice(0, 10); // Keep last 10
      localStorage.setItem('quickqr_scan_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('quickqr_scan_history');
  };

  // Start Camera Stream
  const startCamera = async (currentFacingMode = facingMode) => {
    setScanError(null);
    setIsScanning(true);
    
    // Stop any existing stream first
    stopCamera();

    try {
      const constraints = {
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        videoRef.current.play();
        setCameraActive(true);
        
        // Start decoding loop
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
      }

      // Enumerate other video sources for switcher support
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoInputs);
      } catch (e) {
        console.warn("Could not list video devices", e);
      }

    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraActive(false);
      setIsScanning(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setHasCameraPermission(false);
        setScanError('Camera permission denied. Please click the camera icon in your browser URL bar to grant camera access and reload.');
      } else {
        setHasCameraPermission(false);
        setScanError('Could not access your device camera. Please make sure no other application is using it, or try switching to "Image Upload" mode.');
      }
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setIsScanning(false);
  };

  // Live Scan Loop
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      // Scale canvas to match source video frame size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame onto canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Extract raw pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Pass raw pixel data to jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data.trim() !== '') {
        // Found QR code!
        setScanResult(code.data);
        saveToHistory(code.data);
        
        // Provide haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(120);
        }

        // Auto pause/stop scanning to let user absorb result
        stopCamera();
        return;
      }
    }

    // Continue frame processing
    if (videoRef.current && streamRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // Toggle Front/Back Camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  // Sync camera streaming on tab switch or unmount
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Handle Image Upload File Parsing
  const handleImageFile = (file: File) => {
    setScanError(null);
    setScanResult(null);
    setUploadedImageSrc(null);

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setScanError('Unsupported file format. Please upload a standard image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const resultSrc = event.target.result as string;
        setUploadedImageSrc(resultSrc);

        // Process image to canvas
        const img = new Image();
        img.onload = () => {
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) {
            setScanError('Failed to initialize decoding canvas.');
            return;
          }

          // Limit canvas resolution to keep scan fast and avoid crashing browsers
          const maxDimension = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDimension || h > maxDimension) {
            if (w > h) {
              h = Math.round((h * maxDimension) / w);
              w = maxDimension;
            } else {
              w = Math.round((w * maxDimension) / h);
              h = maxDimension;
            }
          }

          tempCanvas.width = w;
          tempCanvas.height = h;
          tempCtx.drawImage(img, 0, 0, w, h);

          const imageData = tempCtx.getImageData(0, 0, w, h);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data.trim() !== '') {
            setScanResult(code.data);
            saveToHistory(code.data);
            
            if (navigator.vibrate) {
              navigator.vibrate(80);
            }
          } else {
            // Retry with inverting light/dark modules in case of transparent background QRs
            const codeInverted = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (codeInverted && codeInverted.data.trim() !== '') {
              setScanResult(codeInverted.data);
              saveToHistory(codeInverted.data);
            } else {
              setScanError('No QR Code detected in this image. Ensure the code is sharp, well-lit, not skewed, and fully visible.');
            }
          }
        };
        img.onerror = () => {
          setScanError('Failed to load image file.');
        };
        img.src = resultSrc;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Action Bar Helpers
  const handleCopy = async () => {
    if (!scanResult) return;
    try {
      await navigator.clipboard.writeText(scanResult);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  const handleDownloadResult = () => {
    if (!scanResult) return;
    const blob = new Blob([scanResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-scan-result-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Classify detected result
  const isUrl = scanResult ? (scanResult.trim().startsWith('http://') || scanResult.trim().startsWith('https://')) : false;
  const isWifi = scanResult ? scanResult.trim().toUpperCase().startsWith('WIFI:') : false;
  const isMail = scanResult ? scanResult.trim().toLowerCase().startsWith('mailto:') : false;
  const isPhone = scanResult ? scanResult.trim().toLowerCase().startsWith('tel:') : false;
  const isVcard = scanResult ? (scanResult.trim().toUpperCase().startsWith('BEGIN:VCARD') || scanResult.trim().toUpperCase().startsWith('MECARD:')) : false;
  const isSms = scanResult ? (scanResult.trim().toUpperCase().startsWith('SMSTO:') || scanResult.trim().toUpperCase().startsWith('SMS:')) : false;
  const isGeo = scanResult ? scanResult.trim().toLowerCase().startsWith('geo:') : false;

  const parseType = () => {
    if (isUrl) return 'Website Address (URL)';
    if (isWifi) return 'Wireless SSID (WiFi)';
    if (isMail) return 'E-mail Protocol';
    if (isPhone) return 'Phone/Call Protocol';
    if (isVcard) return 'vCard / Contact Card';
    if (isSms) return 'SMS Text Message';
    if (isGeo) return 'GPS Geolocation';
    return 'Plain Text / Content';
  };

  // Sync selected scanner type on scan result change
  useEffect(() => {
    if (scanResult) {
      const clean = scanResult.trim();
      if (clean.startsWith('http://') || clean.startsWith('https://')) {
        setSelectedScannerType('url');
      } else if (clean.toUpperCase().startsWith('WIFI:')) {
        setSelectedScannerType('wifi');
      } else if (clean.toUpperCase().startsWith('BEGIN:VCARD') || clean.toUpperCase().startsWith('MECARD:')) {
        setSelectedScannerType('vcard');
      } else if (clean.toUpperCase().startsWith('SMSTO:') || clean.toUpperCase().startsWith('SMS:') || clean.toLowerCase().startsWith('mailto:')) {
        setSelectedScannerType('mail_sms');
      } else if (clean.toLowerCase().startsWith('geo:')) {
        setSelectedScannerType('geo');
      } else {
        setSelectedScannerType('auto');
      }
    }
  }, [scanResult]);

  return (
    <div className="bg-slate-50 min-h-screen" id="scanner-page-root">
      
      {/* Search Engine Optimization */}
      <SEOHead 
        title="Free QR Code Scanner Online - Instant Online QR Code Scanner"
        description="Need a free qr code scanner? Scan instantly with our online qr code scanner from image files or webcam. Works on PC, Android & iOS with zero installation."
        keywords="qr code scanner, qr code scanner online, free qr code scanner, qr code scanner from image, online qr code scanner, qr code scanner online free, qr code scanner android, qr code scanner PC, qr code scanner website, qr code scanner app, qr code scanner for wifi password, wifi qr code scanner"
        path="/qr-scanner"
        schemas={[scannerPageSchema]}
      />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-20 pb-20 border-b border-slate-100" id="hero-section">
        <div className="absolute inset-0 bg-radial-gradient from-sky-50/40 via-white to-white pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50/50 px-3.5 py-1.5 text-xs font-semibold text-indigo-950 mb-6 border border-indigo-100 shadow-sm animate-fade-in" id="hero-badge">
            <Sparkles className="h-4 w-4 text-indigo-600 fill-indigo-200" />
            <span>Scan QR Codes Instantly for Free</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none">
            Free QR Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Scanner Online</span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Scan physical barcodes directly with your camera or drag and drop screenshots, photos, and files. Decoded entirely inside your browser for 100% airtight privacy.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4" id="hero-ctas">
            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs hover:border-slate-300 cursor-pointer"
              id="btn-hero-generate"
            >
              Generate QR Code
              <Zap className="h-5 w-5 text-indigo-500 shrink-0" />
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('scanner-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-4 text-base font-bold text-white shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:bg-indigo-700 cursor-pointer"
              id="btn-hero-scanner"
            >
              <Camera className="h-5 w-5 text-indigo-200 shrink-0" />
              Scan QR Code Online
            </button>
          </div>

          {/* Core Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-slate-400 text-xs font-mono" id="hero-trust-metrics">
            <span className="flex items-center gap-1.5 font-medium">✓ No Log-In Required</span>
            <span className="flex items-center gap-1.5 font-medium">⚡ Instant Processing</span>
            <span className="flex items-center gap-1.5 font-medium">🔒 No Data Saved</span>
          </div>

        </div>
      </section>

      {/* 2. SCANNER CONTENT SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl" id="scanner-section">
        
        {/* Specialized Decoders Selector Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs mb-8" id="specialized-decoders-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4">
            <div className="text-left">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 fill-indigo-100" />
                Specialized QR Decoders
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Filter by specific type, load pre-configured testing samples, or view parsed details in fully-featured interactive templates.
              </p>
            </div>
            
            {/* Quick Test Sample trigger dropdown/buttons to make testing fully interactive without physical images */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">💡 Quick Live-Test:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => loadTestSample('wifi')}
                  className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/50 rounded-lg transition cursor-pointer"
                >
                  📡 Wi-Fi
                </button>
                <button
                  onClick={() => loadTestSample('vcard')}
                  className="px-2.5 py-1 text-[10px] font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/50 rounded-lg transition cursor-pointer"
                >
                  📇 vCard
                </button>
                <button
                  onClick={() => loadTestSample('url')}
                  className="px-2.5 py-1 text-[10px] font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/50 rounded-lg transition cursor-pointer"
                >
                  🔗 Link
                </button>
                <button
                  onClick={() => loadTestSample('mail_sms')}
                  className="px-2.5 py-1 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/50 rounded-lg transition cursor-pointer"
                >
                  ✉️ Mail/SMS
                </button>
                <button
                  onClick={() => loadTestSample('geo')}
                  className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/50 rounded-lg transition cursor-pointer"
                >
                  📍 GPS
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" id="specialized-tabs">
            {/* Auto Detect Tab */}
            <button
              onClick={() => setSelectedScannerType('auto')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer group ${
                selectedScannerType === 'auto'
                  ? 'border-indigo-600 bg-indigo-50/30 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100/50'
              }`}
            >
              <QrCode className={`h-5 w-5 mb-1.5 transition ${selectedScannerType === 'auto' ? 'text-indigo-600 scale-105' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className={`text-[11px] font-bold ${selectedScannerType === 'auto' ? 'text-indigo-950' : 'text-slate-600'}`}>Smart Auto</span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Detect Format</span>
            </button>

            {/* WiFi Network Tab */}
            <button
              onClick={() => setSelectedScannerType('wifi')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer group ${
                selectedScannerType === 'wifi'
                  ? 'border-amber-500 bg-amber-50/20 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100/50'
              }`}
            >
              <Wifi className={`h-5 w-5 mb-1.5 transition ${selectedScannerType === 'wifi' ? 'text-amber-500 scale-105' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className={`text-[11px] font-bold ${selectedScannerType === 'wifi' ? 'text-amber-950' : 'text-slate-600'}`}>Wi-Fi Scanner</span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">SSID & Passkey</span>
            </button>

            {/* vCard Contact Tab */}
            <button
              onClick={() => setSelectedScannerType('vcard')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer group ${
                selectedScannerType === 'vcard'
                  ? 'border-teal-500 bg-teal-50/20 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100/50'
              }`}
            >
              <User className={`h-5 w-5 mb-1.5 transition ${selectedScannerType === 'vcard' ? 'text-teal-500 scale-105' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className={`text-[11px] font-bold ${selectedScannerType === 'vcard' ? 'text-teal-950' : 'text-slate-600'}`}>vCard Contact</span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Personal Details</span>
            </button>

            {/* URL Link Tab */}
            <button
              onClick={() => setSelectedScannerType('url')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer group ${
                selectedScannerType === 'url'
                  ? 'border-sky-500 bg-sky-50/20 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100/50'
              }`}
            >
              <Globe className={`h-5 w-5 mb-1.5 transition ${selectedScannerType === 'url' ? 'text-sky-500 scale-105' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className={`text-[11px] font-bold ${selectedScannerType === 'url' ? 'text-sky-950' : 'text-slate-600'}`}>URL Safe Link</span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Secure Preview</span>
            </button>

            {/* Email & SMS Tab */}
            <button
              onClick={() => setSelectedScannerType('mail_sms')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer group ${
                selectedScannerType === 'mail_sms'
                  ? 'border-purple-500 bg-purple-50/20 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100/50'
              }`}
            >
              <Mail className={`h-5 w-5 mb-1.5 transition ${selectedScannerType === 'mail_sms' ? 'text-purple-500 scale-105' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className={`text-[11px] font-bold ${selectedScannerType === 'mail_sms' ? 'text-purple-950' : 'text-slate-600'}`}>Email & SMS</span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Messaging Draft</span>
            </button>

            {/* GPS Location Tab */}
            <button
              onClick={() => setSelectedScannerType('geo')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer group ${
                selectedScannerType === 'geo'
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                  : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100/50'
              }`}
            >
              <MapPin className={`h-5 w-5 mb-1.5 transition ${selectedScannerType === 'geo' ? 'text-emerald-500 scale-105' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className={`text-[11px] font-bold ${selectedScannerType === 'geo' ? 'text-emerald-950' : 'text-slate-600'}`}>GPS Location</span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">Maps Navigation</span>
            </button>
          </div>
        </div>
        
        {/* Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="scanner-grid">
          
          {/* LEFT SIDE: SCAN ENGINE */}
          <div className="lg:col-span-7 space-y-6" id="scanner-configurator">
            
            {/* IMAGE FILE UPLOAD PANEL */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4" id="upload-scanner-panel">
              
              {/* Drag zone container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/40 scale-99'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
                id="drop-zone"
              >
                {/* Standard file input (browsing files) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                {/* Camera-Only File Input (opens native camera directly on mobile devices without gallery/photo-library access prompt) */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  capture="environment"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {uploadedImageSrc ? (
                  <div className="space-y-4 w-full max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-square bg-white flex items-center justify-center">
                      <img 
                        src={uploadedImageSrc} 
                        alt="Uploaded QR code" 
                        className="max-h-full max-w-full object-contain p-2"
                      />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold uppercase transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Choose Different Image
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full mb-3.5">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Drag & Drop QR Image File Here</h4>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-[260px] leading-relaxed mx-auto">
                        Supports <strong>PNG, JPG, JPEG, and WEBP</strong> screenshot or picture uploads. Or click to browse folders.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cameraInputRef.current?.click();
                        }}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-sm shadow-indigo-100"
                        id="btn-capture-qr"
                      >
                        <Camera className="h-4 w-4" />
                        Capture QR Code
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Error Banner if file invalid or QR reading failed */}
              {scanError && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-red-800 animate-fade-in" id="upload-error-box">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">Decoding Attempt Failed</h4>
                    <p className="text-[11px] mt-0.5 leading-relaxed text-red-700/90">{scanError}</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDE: RESULTS CARD & SCAN HISTORY */}
          <div className="lg:col-span-5 space-y-6" id="scanner-sidebar">
            
            {/* Decoded Output Box */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md sticky top-24 flex flex-col space-y-5" id="scan-results-card">
              
              <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  <QrCode className="h-4 w-4 text-indigo-500 shrink-0" />
                  Decoded Scanner Result
                </span>
                
                {scanResult && (
                  <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-md">
                    Detected!
                  </span>
                )}
              </div>

              {/* Core Output Viewport */}
              <div className="relative p-5 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200/80 flex flex-col items-center justify-center min-h-[250px] w-full" id="scan-viewport-holder">
                
                {scanResult ? (
                  <div className="w-full h-full flex flex-col justify-between space-y-4 animate-fade-in" id="active-scan-results">
                    
                    {/* Header info detailing type detected */}
                    <div className="space-y-3 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono tracking-wider text-indigo-600 uppercase font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                          DETECTED_TYPE: {parseType()}
                        </span>
                        
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Length: {scanResult.length} chars
                        </span>
                      </div>

                      {/* --- Specialized Dynamic Sub-Views --- */}

                      {/* A. WIFI CREDENTIALS CARD */}
                      {(selectedScannerType === 'wifi' || (selectedScannerType === 'auto' && isWifi)) && (
                        (() => {
                          const wifi = parseWifi(scanResult);
                          if (!wifi) return null;
                          return (
                            <div className="bg-amber-50/40 border border-amber-200/60 p-4 rounded-xl space-y-3 shadow-xs w-full text-left" id="wifi-specialized-card">
                              <div className="flex items-center gap-2.5 border-b border-amber-200/40 pb-2">
                                <div className="bg-amber-500 text-white p-1.5 rounded-lg">
                                  <Wifi className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-amber-950">Wi-Fi Decrypted Credentials</h5>
                                  <p className="text-[10px] text-amber-700 font-mono">Format: WIFI:S:&lt;SSID&gt;;P:&lt;PASS&gt;</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-800">Network SSID (Name)</span>
                                  <span className="text-sm font-bold text-slate-800 break-all bg-white px-2.5 py-1.5 rounded-lg border border-amber-200/20 shadow-2xs select-all">
                                    {wifi.ssid || 'Unknown SSID'}
                                  </span>
                                </div>

                                <div className="flex flex-col">
                                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-800">Network Password</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="relative flex-1">
                                      <input
                                        type={showWifiPassword ? 'text' : 'password'}
                                        value={wifi.password || ''}
                                        readOnly
                                        className="w-full text-xs font-mono font-bold text-slate-800 bg-white px-2.5 py-2 pr-9 rounded-lg border border-amber-200/20 shadow-2xs focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setShowWifiPassword(!showWifiPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
                                      >
                                        {showWifiPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                      </button>
                                    </div>
                                    {wifi.password && (
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(wifi.password || '');
                                          setIsCopied(true);
                                          setTimeout(() => setIsCopied(false), 2000);
                                        }}
                                        className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
                                        title="Copy Password Only"
                                      >
                                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                                  <div className="bg-amber-100/50 px-2 py-1.5 rounded-md flex items-center justify-between text-amber-900">
                                    <span>Encryption:</span>
                                    <span className="font-bold uppercase">{wifi.encryption || 'WPA'}</span>
                                  </div>
                                  <div className="bg-amber-100/50 px-2 py-1.5 rounded-md flex items-center justify-between text-amber-900">
                                    <span>Hidden:</span>
                                    <span className="font-bold uppercase">{wifi.hidden ? 'Yes' : 'No'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 text-[10px] text-amber-900 leading-relaxed space-y-1">
                                <span className="font-bold flex items-center gap-1"><Lock className="h-3 w-3" /> Quick Connect Guide:</span>
                                <ol className="list-decimal list-inside space-y-0.5 text-amber-800/90 font-sans">
                                  <li>Copy the network password.</li>
                                  <li>Go to your device's <strong>Wi-Fi Settings</strong>.</li>
                                  <li>Select network: <strong>{wifi.ssid}</strong></li>
                                  <li>Paste the copied password & connect.</li>
                                </ol>
                              </div>
                            </div>
                          );
                        })()
                      )}

                      {/* B. VCARD CONTACTS CARD */}
                      {(selectedScannerType === 'vcard' || (selectedScannerType === 'auto' && isVcard)) && (
                        (() => {
                          const contact = parseContact(scanResult);
                          if (!contact) return null;
                          const initials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'QR';
                          return (
                            <div className="bg-teal-50/40 border border-teal-200/60 p-4 rounded-xl space-y-3.5 shadow-xs w-full text-left" id="vcard-specialized-card">
                              <div className="flex items-center gap-3 border-b border-teal-200/40 pb-2.5">
                                <div className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold font-display text-sm shrink-0">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-teal-950 truncate select-all">{contact.name}</h5>
                                  <p className="text-[10px] text-teal-700 truncate">{contact.title || contact.org || 'Contact vCard Details'}</p>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-xs text-slate-700">
                                {contact.phone && (
                                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-teal-200/10">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Phone className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                      <span className="font-mono text-[11px] truncate select-all">{contact.phone}</span>
                                    </div>
                                    <a
                                      href={`tel:${contact.phone}`}
                                      className="p-1 text-teal-600 hover:text-teal-800 transition"
                                      title="Dial Phone"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  </div>
                                )}

                                {contact.email && (
                                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-teal-200/10">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Mail className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                      <span className="text-[11px] truncate select-all">{contact.email}</span>
                                    </div>
                                    <a
                                      href={`mailto:${contact.email}`}
                                      className="p-1 text-teal-600 hover:text-teal-800 transition"
                                      title="Compose E-mail"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  </div>
                                )}

                                {contact.url && (
                                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-teal-200/10">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Globe className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                                      <span className="text-[11px] truncate text-slate-500 select-all">{contact.url}</span>
                                    </div>
                                    <a
                                      href={contact.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-teal-600 hover:text-teal-800 transition"
                                      title="Open Website"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  </div>
                                )}

                                {contact.address && (
                                  <div className="flex flex-col bg-white p-2.5 rounded-lg border border-teal-200/10">
                                    <span className="text-[9px] font-mono text-teal-800 uppercase font-bold mb-0.5">Physical Address:</span>
                                    <span className="text-[11px] text-slate-600 break-all select-all leading-snug">{contact.address}</span>
                                  </div>
                                )}

                                {contact.note && (
                                  <div className="flex flex-col bg-slate-100 p-2.5 rounded-lg">
                                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold mb-0.5">vCard Note:</span>
                                    <span className="text-[11px] italic text-slate-600 leading-snug">{contact.note}</span>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => triggerVCardDownload(contact)}
                                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
                              >
                                <Download className="h-4 w-4 shrink-0" />
                                <span>Save to Contacts (vCard .VCF)</span>
                              </button>
                            </div>
                          );
                        })()
                      )}

                      {/* C. URL LINK READER CARD */}
                      {(selectedScannerType === 'url' || (selectedScannerType === 'auto' && isUrl)) && (
                        <div className="bg-sky-50/40 border border-sky-200/60 p-4 rounded-xl space-y-3 shadow-xs w-full text-left" id="url-specialized-card">
                          <div className="flex items-center gap-2.5 border-b border-sky-200/40 pb-2">
                            <div className="bg-sky-500 text-white p-1.5 rounded-lg">
                              <Globe className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-sky-950">Secure Link Redirection</h5>
                              <p className="text-[10px] text-sky-700 font-mono">Verified Web Hostname Protocol</p>
                            </div>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-sky-100/50 shadow-2xs space-y-1">
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Raw URL Link:</span>
                            <div className="text-xs text-indigo-950 font-bold break-all select-all underline decoration-indigo-300">
                              {scanResult}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-sky-800 bg-sky-100/50 p-2.5 rounded-lg border border-sky-200/30 leading-snug">
                            <ShieldAlert className="h-4 w-4 text-sky-600 shrink-0" />
                            <span>This URL has been decoded client-side inside your browser memory. Make sure you trust this link before continuing.</span>
                          </div>

                          <a
                            href={scanResult}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 py-3 px-4 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition"
                          >
                            <span>Open Website Securely</span>
                            <ExternalLink className="h-4 w-4 shrink-0 text-sky-200" />
                          </a>
                        </div>
                      )}

                      {/* D. SMS & EMAIL MESSAGING CARD */}
                      {(selectedScannerType === 'mail_sms' || (selectedScannerType === 'auto' && (isMail || isSms))) && (
                        (() => {
                          const sms = parseSMS(scanResult);
                          const email = parseEmail(scanResult);
                          
                          if (sms) {
                            return (
                              <div className="bg-purple-50/40 border border-purple-200/60 p-4 rounded-xl space-y-3.5 shadow-xs w-full text-left" id="sms-specialized-card">
                                <div className="flex items-center gap-2.5 border-b border-purple-200/40 pb-2">
                                  <div className="bg-purple-500 text-white p-1.5 rounded-lg">
                                    <MessageSquare className="h-4.5 w-4.5" />
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-purple-950">Pre-compiled SMS Template</h5>
                                    <p className="text-[10px] text-purple-700 font-mono">Format: SMSTO:&lt;Phone&gt;:&lt;Msg&gt;</p>
                                  </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-mono text-purple-800 uppercase font-bold">Recipient Mobile:</span>
                                    <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-purple-200/10 shadow-2xs select-all text-left">
                                      {sms.phone || 'Unknown Phone'}
                                    </span>
                                  </div>

                                  {sms.message && (
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-mono text-purple-800 uppercase font-bold">Message Content:</span>
                                      <blockquote className="bg-slate-100 p-2.5 rounded-lg border-l-2 border-purple-400 italic text-slate-600 leading-snug break-words">
                                        "{sms.message}"
                                      </blockquote>
                                    </div>
                                  )}
                                </div>

                                <a
                                  href={`sms:${sms.phone}?body=${encodeURIComponent(sms.message || '')}`}
                                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
                                >
                                  <ExternalLink className="h-4 w-4 shrink-0" />
                                  <span>Open Mobile Message App</span>
                                </a>
                              </div>
                            );
                          }

                          if (email) {
                            return (
                              <div className="bg-purple-50/40 border border-purple-200/60 p-4 rounded-xl space-y-3.5 shadow-xs w-full text-left" id="email-specialized-card">
                                <div className="flex items-center gap-2.5 border-b border-purple-200/40 pb-2">
                                  <div className="bg-purple-500 text-white p-1.5 rounded-lg">
                                    <Mail className="h-4.5 w-4.5" />
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-purple-950">Prefilled Email Template</h5>
                                    <p className="text-[10px] text-purple-700 font-mono">Format: mailto:&lt;address&gt;?subject=...</p>
                                  </div>
                                </div>

                                <div className="space-y-2 text-xs text-left">
                                  <div className="flex flex-col">
                                    <span className="text-[9px] font-mono text-purple-800 uppercase font-bold">To Recipient:</span>
                                    <span className="font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-purple-200/10 shadow-2xs select-all text-left">
                                      {email.to || 'Unknown Recipient'}
                                    </span>
                                  </div>

                                  {email.subject && (
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-mono text-purple-800 uppercase font-bold">Subject:</span>
                                      <span className="text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-purple-200/10 shadow-2xs font-medium truncate text-left">
                                        {email.subject}
                                      </span>
                                    </div>
                                  )}

                                  {email.body && (
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-mono text-purple-800 uppercase font-bold">Email Body:</span>
                                      <blockquote className="bg-slate-100 p-2.5 rounded-lg border-l-2 border-purple-400 italic text-slate-600 leading-snug break-words text-left">
                                        "{email.body}"
                                      </blockquote>
                                    </div>
                                  )}
                                </div>

                                <a
                                  href={`mailto:${email.to}?subject=${encodeURIComponent(email.subject || '')}&body=${encodeURIComponent(email.body || '')}`}
                                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
                                >
                                  <ExternalLink className="h-4 w-4 shrink-0 text-purple-200" />
                                  <span>Launch E-mail Dispatcher</span>
                                </a>
                              </div>
                            );
                          }

                          return null;
                        })()
                      )}

                      {/* E. GPS GEOLOCATION MAP CARD */}
                      {(selectedScannerType === 'geo' || (selectedScannerType === 'auto' && isGeo)) && (
                        (() => {
                          const geo = parseGeo(scanResult);
                          if (!geo) return null;
                          return (
                            <div className="bg-emerald-50/40 border border-emerald-200/60 p-4 rounded-xl space-y-3 shadow-xs w-full text-left" id="geo-specialized-card">
                              <div className="flex items-center gap-2.5 border-b border-emerald-200/40 pb-2">
                                <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
                                  <MapPin className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-emerald-950">GPS Coordinates Decoded</h5>
                                  <p className="text-[10px] text-emerald-700 font-mono">Format: geo:&lt;lat&gt;,&lt;lon&gt;</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex flex-col bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                                  <span className="text-[9px] font-mono text-emerald-800 uppercase font-bold text-left">Latitude</span>
                                  <span className="font-mono font-bold text-slate-800 mt-0.5 select-all text-left">{geo.lat}</span>
                                </div>
                                <div className="flex flex-col bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                                  <span className="text-[9px] font-mono text-emerald-800 uppercase font-bold text-left">Longitude</span>
                                  <span className="font-mono font-bold text-slate-800 mt-0.5 select-all text-left">{geo.lon}</span>
                                </div>
                              </div>

                              {geo.query && (
                                <div className="flex flex-col bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs text-xs text-left">
                                  <span className="text-[9px] font-mono text-emerald-800 uppercase font-bold">Decoded Location/Query</span>
                                  <span className="font-bold text-slate-800 mt-0.5 text-left">{geo.query}</span>
                                </div>
                              )}

                              <div className="space-y-1.5 pt-1">
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lon}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                                >
                                  <ExternalLink className="h-4 w-4 shrink-0" />
                                  <span>View on Google Maps</span>
                                </a>

                                <a
                                  href={`https://www.openstreetmap.org/?mlat=${geo.lat}&mlon=${geo.lon}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 py-2 px-4 text-xs font-semibold text-slate-700 transition"
                                >
                                  <span>Open OpenStreetMap</span>
                                </a>
                              </div>
                            </div>
                          );
                        })()
                      )}

                      {/* F. STANDARD TEXT VIEWER BLOCK (Fallback / default) */}
                      {(!isWifi && !isVcard && !isUrl && !isMail && !isSms && !isGeo) && (
                        <div className="bg-white p-4 rounded-xl border border-slate-100/80 shadow-xs max-h-[160px] overflow-y-auto font-mono text-xs text-slate-700 break-all select-all whitespace-pre-wrap leading-relaxed text-left">
                          {scanResult}
                        </div>
                      )}

                    </div>

                    {/* Result context actions standard buttons if no match or plain text */}
                    {!(isWifi || isVcard || isUrl || isMail || isSms || isGeo) && (
                      <div className="space-y-2 w-full">
                        {scanResult.trim().startsWith('tel:') && (
                          <a
                            href={scanResult.trim()}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-3 px-4 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                          >
                            <span>Dial Telephone Number</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        )}
                      </div>
                    )}

                  </div>
                ) : (
                  /* Waiting for scans empty state (Customized by active tab selection) */
                  <div className="flex flex-col items-center justify-center text-center space-y-3.5 p-4 animate-fade-in w-full" id="empty-state">
                    {selectedScannerType === 'wifi' ? (
                      <>
                        <div className="bg-amber-50 text-amber-500 p-4 rounded-full border border-amber-100 animate-pulse">
                          <Wifi className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">WiFi Decrypter Mode Active</h4>
                          <p className="text-[11px] text-slate-400 mt-1.5 max-w-[240px] leading-relaxed mx-auto">
                            Drag & drop or upload a Wi-Fi configuration QR screenshot. Or click the <strong className="text-amber-600 font-bold">📡 Wi-Fi</strong> live-test button above to verify immediate parsing.
                          </p>
                        </div>
                      </>
                    ) : selectedScannerType === 'vcard' ? (
                      <>
                        <div className="bg-teal-50 text-teal-500 p-4 rounded-full border border-teal-100 animate-pulse">
                          <User className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">vCard Personal Contact Decoder</h4>
                          <p className="text-[11px] text-slate-400 mt-1.5 max-w-[240px] leading-relaxed mx-auto">
                            Reads MeCard and vCard personal credentials. Try the live-test button <strong className="text-teal-600 font-bold">📇 vCard</strong> above to view beautiful contact cards with saving.
                          </p>
                        </div>
                      </>
                    ) : selectedScannerType === 'url' ? (
                      <>
                        <div className="bg-sky-50 text-sky-500 p-4 rounded-full border border-sky-100 animate-pulse">
                          <Globe className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">URL Smart Link Reader</h4>
                          <p className="text-[11px] text-slate-400 mt-1.5 max-w-[240px] leading-relaxed mx-auto">
                            Validates domains, checks protocol parameters, and generates safe redirect interfaces. Test it using <strong className="text-sky-600 font-bold">🔗 Link</strong> sample.
                          </p>
                        </div>
                      </>
                    ) : selectedScannerType === 'mail_sms' ? (
                      <>
                        <div className="bg-purple-50 text-purple-500 p-4 rounded-full border border-purple-100 animate-pulse">
                          <Mail className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Email & SMS Draft Parser</h4>
                          <p className="text-[11px] text-slate-400 mt-1.5 max-w-[240px] leading-relaxed mx-auto">
                            Decodes prefilled message structures so you can open them with native messengers. Use the <strong className="text-purple-600 font-bold">✉️ Mail/SMS</strong> test sample.
                          </p>
                        </div>
                      </>
                    ) : selectedScannerType === 'geo' ? (
                      <>
                        <div className="bg-emerald-50 text-emerald-500 p-4 rounded-full border border-emerald-100 animate-pulse">
                          <MapPin className="h-7 w-7" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">GPS Coordinates Decoder</h4>
                          <p className="text-[11px] text-slate-400 mt-1.5 max-w-[240px] leading-relaxed mx-auto">
                            Translates raw geo latitude/longitude into deep navigation links. Click the <strong className="text-emerald-600 font-bold">📍 GPS</strong> button to test coordinates lookup.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-slate-100 p-3.5 rounded-full text-slate-400">
                          <QrCode className="h-6 w-6 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-700">Awaiting Decoded Content</h4>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-[210px] leading-relaxed mx-auto">
                            Drag & drop an image or click "Capture QR Code". When a valid barcode is recognized, the parsed result will show up here.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>

              {/* Action Buttons Panel */}
              {scanResult && (
                <div className="grid grid-cols-2 gap-3" id="scan-actions-holder">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      isCopied 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    id="btn-scan-copy"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-slate-400 shrink-0" />
                        Copy Result
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadResult}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                    id="btn-scan-download-txt"
                  >
                    <Download className="h-4 w-4 text-slate-400 shrink-0" />
                    Download (.txt)
                  </button>
                </div>
              )}

              {/* Reset/Scan Again button */}
              {scanResult && (
                <button
                  onClick={() => {
                    setScanResult(null);
                    setScanError(null);
                    setUploadedImageSrc(null);
                    // If camera was on, prompt can be re-enabled
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                  id="btn-scan-again"
                >
                  <RefreshCw className="h-3.5 w-3.5 animate-spin-reverse" />
                  Clear & Scan New QR Code
                </button>
              )}

              {/* AdSense Native-styled Placeholder inside Action block - Kept but hidden from visible user view */}
              <div className="hidden bg-slate-50/60 p-3 rounded-2xl border border-slate-100 text-center mt-2">
                <span className="text-[8px] font-mono tracking-widest text-slate-400 uppercase">Sponsored Placement</span>
                <div className="h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400 border border-slate-200/50 mt-1">
                  Ad space available for monetization
                </div>
              </div>

            </div>

            {/* Scan History list */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4" id="scan-history-box">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                <h4 className="font-display text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  Local Scan History
                </h4>
                
                {scanHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 transition cursor-pointer"
                    id="btn-clear-scan-history"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {scanHistory.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-4 font-mono">
                  No scanned entries recorded yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scroll-smooth" id="scan-history-items-holder">
                  {scanHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setScanResult(item.content);
                        setScanError(null);
                        // Stop camera so they can inspect history selection
                        stopCamera();
                      }}
                      className="bg-slate-50 hover:bg-indigo-50/30 p-2.5 rounded-xl border border-slate-100/80 transition text-left cursor-pointer flex justify-between items-center group"
                      id={`history-item-${item.id}`}
                    >
                      <div className="space-y-0.5 truncate max-w-[80%]">
                        <p className="text-[11px] font-semibold text-slate-700 truncate font-mono">
                          {item.content}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400">
                          <span className={`px-1.5 py-0.2 rounded-sm text-[8px] font-bold font-mono ${
                            item.type === 'URL' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.type}
                          </span>
                          <span>•</span>
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                      
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition" />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Expanded, Full-Width FAQ Section for SEO Ranking */}
        <div className="mt-16 bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-sm space-y-8" id="scanner-seo-faq">
          <div className="border-b border-slate-100 pb-5 text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Knowledge Base
            </span>
            <h3 className="font-display text-2xl font-extrabold text-slate-900 mt-3 flex items-center gap-2">
              <Info className="h-6 w-6 text-indigo-500 shrink-0" />
              Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-2xl">
              Get answers to all your common questions about decoding QR codes, image upload resolution, system permissions, and mobile security.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Q1 */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:border-slate-200 transition">
              <h4 className="text-sm font-bold text-slate-900">🔒 Does this online QR code scanner save or record my scans?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                No. The image decoding calculations are performed entirely inside your local browser-sandboxed environment (locally in memory). We never send, save, upload, or record your webcam streams, screenshots, or decoded text on any external backend servers. Your scans are kept 100% private and confidential.
              </p>
            </div>
            
            {/* Q2 */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:border-slate-200 transition">
              <h4 className="text-sm font-bold text-slate-900">📸 How do I scan a QR code from a screenshot or image file?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simply take a screenshot of the QR code on your mobile device or computer, then use the <strong>Upload Image File</strong> tab above. Drag and drop the file, or click to upload from your local photo gallery. Our high-performance WebAssembly decoding library parses the pixels and extracts the metadata instantly.
              </p>
            </div>

            {/* Q3 */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:border-slate-200 transition">
              <h4 className="text-sm font-bold text-slate-900">📡 Can I use this scanner to decrypt WiFi passwords?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes! When scanning a WiFi QR code, our specialized WiFi decoder automatically extracts the network SSID, security encryption type (e.g., WPA/WPA2/WEP), and raw security password. You can copy the password directly or scan with a compatible mobile camera to join the network immediately with one tap.
              </p>
            </div>

            {/* Q4 */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:border-slate-200 transition">
              <h4 className="text-sm font-bold text-slate-900">💻 Does this scanner work on PC, Mac, Android, and iOS?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes, our online utility is a fully responsive web application that runs flawlessly on any computer or mobile phone. Whether you are using Chrome, Safari, Edge, Firefox, or Brave, there are no app store packages or browser extensions to install. Simply bookmark <code>quickqrcode.pages.dev</code> for instant access.
              </p>
            </div>

            {/* Q5 */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:border-slate-200 transition">
              <h4 className="text-sm font-bold text-slate-900">🎥 How do I authorize webcam or camera permissions in the browser?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you click "Start Webcam Scanner", your browser will display a secure permission prompt asking to access your video device. Click "Allow" or "Permit". If you previously blocked it, you can click the padlock icon in your browser address bar next to <code>quickqrcode.pages.dev</code> to reset and grant camera permissions.
              </p>
            </div>

            {/* Q6 */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:border-slate-200 transition">
              <h4 className="text-sm font-bold text-slate-900">🆓 Is this QR reader completely free for commercial and personal use?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes, 100% free with unlimited scans. We believe core utilities should be fast, private, and accessible without forcing users through aggressive payment walls, cookie popups, or registration forms. This makes it ideal for professional events, classroom use, business cards, and daily home scanning.
              </p>
            </div>

            {/* Q7 */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:border-slate-200 transition">
              <h4 className="text-sm font-bold text-slate-900">⚠️ Why isn't my QR code scanning? What troubleshooting steps can I take?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If our engine fails to scan, please ensure: (1) The image is sharp and not blurry; (2) The QR code is well-lit and has adequate contrast against its background; (3) The lens is clean; and (4) The code is not severely damaged. Upgrading the QR code's size or using a screenshot instead of a direct angled photo can help.
              </p>
            </div>

            {/* Q8 */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:border-slate-200 transition">
              <h4 className="text-sm font-bold text-slate-900">🏷️ What types of QR formats are supported?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our advanced decoding engine supports Website URLs, plain text payloads, WiFi access configurations, electronic vCards and contact details, pre-composed emails, SMS triggers, direct direct-calling telephone protocols, GPS map coordinates, and social media links.
              </p>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
