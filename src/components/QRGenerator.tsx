import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Globe, 
  FileText, 
  Wifi, 
  PhoneCall, 
  Mail, 
  Download, 
  RotateCcw, 
  Info, 
  Copy, 
  Check, 
  AlertCircle,
  MessageSquare,
  Sparkles,
  QrCode,
  User,
  Share2,
  Upload,
  Trash2,
  FileCode,
  Loader2
} from 'lucide-react';
import { QRType, ErrorCorrectionLevel, QRSize } from '../types';

export default function QRGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Core state
  const [activeType, setActiveType] = useState<QRType>('url');
  const [isCopied, setIsCopied] = useState(false);
  const [isCopyFailed, setIsCopyFailed] = useState(false);
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('M');
  const [qrSize, setQrSize] = useState<QRSize>('medium');
  const [fgColor, setFgColor] = useState('#0f172a'); // slate 900
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeMargin, setIncludeMargin] = useState(true);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Simulated Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatingStep, setGeneratingStep] = useState('');

  interface QRGenSnapshot {
    activeType: QRType;
    rawText: string;
    errorCorrection: ErrorCorrectionLevel;
    qrSize: QRSize;
    fgColor: string;
    bgColor: string;
    includeMargin: boolean;
    logoType: 'none' | 'preset' | 'custom';
    logoPreset: string;
    customLogoSrc: string | null;
    isTransparentBg: boolean;
  }

  const [snapshot, setSnapshot] = useState<QRGenSnapshot | null>(null);

  // Input states
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [phoneType, setPhoneType] = useState<'tel' | 'sms'>('tel');
  const [phoneNum, setPhoneNum] = useState('');
  const [smsMsg, setSmsMsg] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WEP' | 'WPA' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard inputs
  const [vCardFirstName, setVCardFirstName] = useState('');
  const [vCardLastName, setVCardLastName] = useState('');
  const [vCardOrg, setVCardOrg] = useState('');
  const [vCardTitle, setVCardTitle] = useState('');
  const [vCardPhone, setVCardPhone] = useState('');
  const [vCardMobile, setVCardMobile] = useState('');
  const [vCardEmail, setVCardEmail] = useState('');
  const [vCardUrl, setVCardUrl] = useState('');
  const [vCardAddress, setVCardAddress] = useState('');

  // WhatsApp inputs
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappMsg, setWhatsappMsg] = useState('');

  // Social inputs
  const [socialPlatform, setSocialPlatform] = useState('instagram');
  const [socialUsername, setSocialUsername] = useState('');

  // Brand Logo Overlay states
  const [logoType, setLogoType] = useState<'none' | 'preset' | 'custom'>('none');
  const [logoPreset, setLogoPreset] = useState<string>('globe');
  const [customLogoSrc, setCustomLogoSrc] = useState<string | null>(null);
  const [customLogoName, setCustomLogoName] = useState<string>('');
  const [isTransparentBg, setIsTransparentBg] = useState(false);

  // Preset Palettes
  const palettes = [
    { name: 'Pure Slate', fg: '#0f172a', bg: '#ffffff' },
    { name: 'Sky Tech', fg: '#0284c7', bg: '#ffffff' },
    { name: 'Royal Indigo', fg: '#4f46e5', bg: '#f8fafc' },
    { name: 'Sunset Orange', fg: '#ea580c', bg: '#fffaf8' },
    { name: 'Forest Mint', fg: '#059669', bg: '#f0fdf4' },
    { name: 'Ruby Wine', fg: '#9f1239', bg: '#fff1f2' },
  ];

  // Map size to dimension
  const getDimension = (sz: QRSize): number => {
    switch (sz) {
      case 'small': return 250;
      case 'medium': return 400;
      case 'large': return 650;
    }
  };

  // Compile RAW text from input configurations
  const getRawText = (): string => {
    switch (activeType) {
      case 'url':
        let formattedUrl = urlInput.trim();
        if (!formattedUrl) return '';
        if (!/^https?:\/\//i.test(formattedUrl)) {
          formattedUrl = `https://${formattedUrl}`;
        }
        return formattedUrl;

      case 'text':
        return textInput || '';

      case 'phone':
        const cleanPhone = phoneNum.replace(/\s+/g, '');
        if (!cleanPhone) return '';
        if (phoneType === 'sms') {
          return `SMSTO:${cleanPhone}:${smsMsg}`;
        }
        return `tel:${cleanPhone}`;

      case 'email':
        if (!emailTo.trim()) return '';
        const subjectEsc = encodeURIComponent(emailSubject);
        const bodyEsc = encodeURIComponent(emailBody);
        return `mailto:${emailTo.trim()}?subject=${subjectEsc}&body=${bodyEsc}`;

      case 'wifi':
        if (!wifiSsid) return '';
        const ssidEsc = wifiSsid.replace(/([\\;,:])/g, '\\$1');
        const passEsc = wifiPassword.replace(/([\\;,:])/g, '\\$1');
        const hiddenStr = wifiHidden ? 'true' : 'false';
        let wifiString = `WIFI:S:${ssidEsc};T:${wifiEncryption};`;
        if (wifiEncryption !== 'nopass') {
          wifiString += `P:${passEsc};`;
        }
        wifiString += `H:${hiddenStr};;`;
        return wifiString;

      case 'vcard':
        if (!vCardFirstName.trim() && !vCardLastName.trim()) return '';
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${vCardLastName.trim()};${vCardFirstName.trim()};;;`,
          `FN:${vCardFirstName.trim()} ${vCardLastName.trim()}`.trim(),
          vCardOrg.trim() ? `ORG:${vCardOrg.trim()}` : '',
          vCardTitle.trim() ? `TITLE:${vCardTitle.trim()}` : '',
          vCardPhone.trim() ? `TEL;TYPE=WORK,VOICE:${vCardPhone.trim()}` : '',
          vCardMobile.trim() ? `TEL;TYPE=CELL,VOICE:${vCardMobile.trim()}` : '',
          vCardEmail.trim() ? `EMAIL;TYPE=PREF,INTERNET:${vCardEmail.trim()}` : '',
          vCardUrl.trim() ? `URL:${vCardUrl.trim()}` : '',
          vCardAddress.trim() ? `ADR;TYPE=WORK:;;${vCardAddress.trim()};;;;` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');

      case 'whatsapp':
        const cleanWaPhone = whatsappPhone.replace(/[^0-9]/g, '');
        if (!cleanWaPhone) return '';
        const waMsgEsc = encodeURIComponent(whatsappMsg);
        return `https://wa.me/${cleanWaPhone}${waMsgEsc ? `?text=${waMsgEsc}` : ''}`;

      case 'social':
        if (!socialUsername.trim()) return '';
        const user = socialUsername.trim();
        switch (socialPlatform) {
          case 'instagram': return `https://instagram.com/${user}`;
          case 'facebook': return `https://facebook.com/${user}`;
          case 'youtube': return `https://youtube.com/@${user.replace(/^@/, '')}`;
          case 'linkedin': return `https://linkedin.com/in/${user}`;
          case 'twitter': return `https://x.com/${user}`;
          case 'tiktok': return `https://tiktok.com/@${user.replace(/^@/, '')}`;
          case 'github': return `https://github.com/${user}`;
          default: return '';
        }

      default:
        return '';
    }
  };

  // Preset SVG Logos mapping for brand integration inside QR codes
  const getPresetLogoSvg = (preset: string, color: string): string => {
    let path = '';
    let viewBox = '0 0 24 24';
    if (preset === 'whatsapp') {
      path = '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="' + color + '"/>';
    } else if (preset === 'facebook') {
      path = '<path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" fill="' + color + '"/>';
    } else if (preset === 'instagram') {
      path = '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="' + color + '"/>';
    } else if (preset === 'youtube') {
      path = '<path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.108C19.525 3.5 12 3.5 12 3.5s-7.525 0-9.388.555A3.002 3.002 0 00.502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.002 3.002 0 002.11 2.108c1.863.555 9.388.555 9.388.555s7.525 0 9.388-.555a3.002 3.002 0 002.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="' + color + '"/>';
    } else if (preset === 'linkedin') {
      path = '<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="' + color + '"/>';
    } else if (preset === 'twitter') {
      path = '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="' + color + '"/>';
    } else if (preset === 'github') {
      path = '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="' + color + '"/>';
    } else if (preset === 'globe') {
      path = '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 110-16 8 8 0 010 16z" fill="' + color + '"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="' + color + '" stroke-width="1.5" fill="none"/><path d="M2 12h20M12 2v20" stroke="' + color + '" stroke-width="1.5" fill="none"/>';
    } else if (preset === 'wifi') {
      path = '<path d="M12 18a2 2 0 100 4 2 2 0 000-4zm-7.071-7.071a10 10 0 0114.142 0l-1.414 1.414a8 8 0 00-11.314 0zM1.414 7.414a15 15 0 0121.172 0l-1.414 1.414a13 13 0 00-18.344 0z" fill="' + color + '"/>';
    } else if (preset === 'mail') {
      path = '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="' + color + '"/>';
    } else if (preset === 'link') {
      path = '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="' + color + '" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="' + color + '" stroke-width="2" stroke-linecap="round" fill="none"/>';
    } else if (preset === 'phone') {
      path = '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" fill="' + color + '"/>';
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%">${path}</svg>`;
  };

  // Asynchronously draws standard/custom brand logos on top of the generated QR code canvas
  const drawLogoOnCanvas = (
    currentLogoType: 'none' | 'preset' | 'custom',
    currentLogoPreset: string,
    currentFgColor: string,
    currentCustomLogoSrc: string | null,
    currentQrSize: QRSize,
    currentIsTransparentBg: boolean,
    currentBgColor: string
  ) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentLogoType === 'none') return;

    const logoImg = new Image();
    
    logoImg.onload = () => {
      const dimension = getDimension(currentQrSize);
      
      // Logo takes around 20% of the entire QR dimension
      const logoScale = 0.20;
      const logoW = dimension * logoScale;
      const logoH = dimension * logoScale;
      const logoX = (dimension - logoW) / 2;
      const logoY = (dimension - logoH) / 2;

      // Draw a protective background shield shape to clear out the QR modules underneath cleanly
      ctx.fillStyle = currentIsTransparentBg ? '#ffffff' : currentBgColor;
      
      const padding = logoW * 0.22; 
      const shieldW = logoW + padding;
      const shieldH = logoH + padding;
      const shieldX = logoX - padding / 2;
      const shieldY = logoY - padding / 2;

      // Draw rounded rectangle
      ctx.beginPath();
      const r = shieldW * 0.25; // corner radius
      ctx.moveTo(shieldX + r, shieldY);
      ctx.lineTo(shieldX + shieldW - r, shieldY);
      ctx.quadraticCurveTo(shieldX + shieldW, shieldY, shieldX + shieldW, shieldY + r);
      ctx.lineTo(shieldX + shieldW, shieldY + shieldH - r);
      ctx.quadraticCurveTo(shieldX + shieldW, shieldY + shieldH, shieldX + shieldW - r, shieldY + shieldH);
      ctx.lineTo(shieldX + r, shieldY + shieldH);
      ctx.quadraticCurveTo(shieldX, shieldY + shieldH, shieldX, shieldY + shieldH - r);
      ctx.lineTo(shieldX, shieldY + r);
      ctx.quadraticCurveTo(shieldX, shieldY, shieldX + r, shieldY);
      ctx.closePath();
      ctx.fill();

      // Outer border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw logo
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    };

    if (currentLogoType === 'preset') {
      const svgString = getPresetLogoSvg(currentLogoPreset, currentFgColor);
      logoImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
    } else if (currentLogoType === 'custom' && currentCustomLogoSrc) {
      logoImg.src = currentCustomLogoSrc;
    }
  };

  // Render the QR code to Canvas when snapshot changes
  useEffect(() => {
    setGenerateError(null);

    if (!canvasRef.current) return;

    if (!snapshot || !snapshot.rawText) {
      // Draw placeholder inside canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '13px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('Click Generate to build and preview', canvas.width / 2, canvas.height / 2);
      }
      return;
    }

    const dimension = getDimension(snapshot.qrSize);
    const lightColor = snapshot.isTransparentBg ? '#ffffff00' : snapshot.bgColor;

    QRCode.toCanvas(
      canvasRef.current,
      snapshot.rawText,
      {
        width: dimension,
        margin: snapshot.includeMargin ? 4 : 0,
        color: {
          dark: snapshot.fgColor,
          light: lightColor,
        },
        errorCorrectionLevel: snapshot.errorCorrection,
      },
      (error) => {
        if (error) {
          console.error(error);
          setGenerateError(
            error.message || 'Rendering failed. The data package might be too large for the error level.'
          );
        } else {
          if (snapshot.logoType !== 'none') {
            // Draw logo on top
            drawLogoOnCanvas(
              snapshot.logoType,
              snapshot.logoPreset,
              snapshot.fgColor,
              snapshot.customLogoSrc,
              snapshot.qrSize,
              snapshot.isTransparentBg,
              snapshot.bgColor
            );
          }
        }
      }
    );
  }, [snapshot]);

  // Handle generation capture
  const handleGenerate = () => {
    const rawText = getRawText();
    if (!rawText || rawText.trim() === '') {
      let specificError = 'Please enter some content before generating a QR code.';
      switch (activeType) {
        case 'url':
          specificError = "You have not entered a Website URL! Please type a website address (e.g., example.com or https://example.com) inside the URL field to generate your QR Code.";
          break;
        case 'text':
          specificError = "You have not entered any Plain Text! Please write or paste some text inside the Plain Text writer to generate your QR Code.";
          break;
        case 'phone':
          specificError = "You have not entered a Phone Number! Please write a receiver phone number to generate your Phone/SMS QR Code.";
          break;
        case 'email':
          specificError = "You have not entered a Recipient Email address! Please supply a destination email address (e.g., contact@business.com) to generate your Email QR Code.";
          break;
        case 'wifi':
          specificError = "You have not entered the WiFi Network Name (SSID)! Please type your network name (SSID) to generate your WiFi QR Code.";
          break;
        case 'vcard':
          specificError = "You have not entered any Contact Name details! Please fill out at least a First Name or Last Name to generate your vCard QR Code.";
          break;
        case 'whatsapp':
          specificError = "You have not entered a WhatsApp Phone Number! Please write a valid mobile phone number with country code (e.g., 15551234567) to generate your WhatsApp QR Code.";
          break;
        case 'social':
          specificError = "You have not entered a Social Media Username/Handle! Please supply your profile handle to generate your Social QR Code.";
          break;
      }
      setGenerateError(specificError);
      return;
    }

    setGenerateError(null);
    setIsGenerating(true);
    setGenerationProgress(5);
    setGeneratingStep('Initializing QR encoder engine...');

    // Multi-step realistic timeline delay
    setTimeout(() => {
      setGenerationProgress(25);
      setGeneratingStep('Parsing metadata & encoding alphanumeric bytes...');
    }, 400);

    setTimeout(() => {
      setGenerationProgress(50);
      setGeneratingStep('Generating high-density vector matrix grid...');
    }, 900);

    setTimeout(() => {
      setGenerationProgress(75);
      setGeneratingStep('Applying Reed-Solomon error correction matrices...');
    }, 1400);

    setTimeout(() => {
      setGenerationProgress(95);
      setGeneratingStep('Injecting brand overlays & custom color styles...');
    }, 1900);

    setTimeout(() => {
      setSnapshot({
        activeType,
        rawText,
        errorCorrection,
        qrSize,
        fgColor,
        bgColor,
        includeMargin,
        logoType,
        logoPreset,
        customLogoSrc,
        isTransparentBg,
      });
      setIsGenerating(false);
      setGenerationProgress(100);
      setGeneratingStep('QR Code Generated Successfully!');
    }, 2400);
  };

  // Helper to check if current live options differ from generated snapshot
  const isDirty = !snapshot || isGenerating ? false : (
    activeType !== snapshot.activeType ||
    getRawText() !== snapshot.rawText ||
    errorCorrection !== snapshot.errorCorrection ||
    qrSize !== snapshot.qrSize ||
    fgColor !== snapshot.fgColor ||
    bgColor !== snapshot.bgColor ||
    includeMargin !== snapshot.includeMargin ||
    logoType !== snapshot.logoType ||
    logoPreset !== snapshot.logoPreset ||
    customLogoSrc !== snapshot.customLogoSrc ||
    isTransparentBg !== snapshot.isTransparentBg
  );

  // Handle high quality download
  const handleDownload = () => {
    if (!canvasRef.current || !snapshot) return;
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const filename = `quick-qr-${snapshot.activeType}-${Date.now()}.png`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error', err);
    }
  };

  // Copy Image to Clipboard
  const handleCopyClipboard = async () => {
    if (!canvasRef.current || !snapshot) return;
    setIsCopyFailed(false);
    
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          setIsCopyFailed(true);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (clipErr) {
          console.error('Clipboard action blocked or unsupported', clipErr);
          setIsCopyFailed(true);
          setTimeout(() => setIsCopyFailed(false), 3000);
        }
      }, 'image/png');
    } catch (err) {
      setIsCopyFailed(true);
      setTimeout(() => setIsCopyFailed(false), 3000);
    }
  };

  const handleReset = () => {
    setUrlInput('');
    setTextInput('');
    setPhoneNum('');
    setSmsMsg('');
    setEmailTo('');
    setEmailSubject('');
    setEmailBody('');
    setWifiSsid('');
    setWifiPassword('');
    setWifiEncryption('WPA');
    setWifiHidden(false);
    setVCardFirstName('');
    setVCardLastName('');
    setVCardOrg('');
    setVCardTitle('');
    setVCardPhone('');
    setVCardMobile('');
    setVCardEmail('');
    setVCardUrl('');
    setVCardAddress('');
    setWhatsappPhone('');
    setWhatsappMsg('');
    setSocialPlatform('instagram');
    setSocialUsername('');
    setLogoType('none');
    setLogoPreset('globe');
    setCustomLogoSrc(null);
    setCustomLogoName('');
    setIsTransparentBg(false);
    setErrorCorrection('M');
    setQrSize('medium');
    setFgColor('#0f172a');
    setBgColor('#ffffff');
    setIncludeMargin(true);
    setSnapshot(null);
  };

  const handleDownloadSvg = () => {
    if (!snapshot) return;

    QRCode.toString(
      snapshot.rawText,
      {
        type: 'svg',
        margin: snapshot.includeMargin ? 4 : 0,
        color: {
          dark: snapshot.fgColor,
          light: snapshot.isTransparentBg ? '#ffffff00' : snapshot.bgColor,
        },
        errorCorrectionLevel: snapshot.errorCorrection,
      },
      (err, svgString) => {
        if (err) {
          console.error(err);
          return;
        }

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const dataUrl = URL.createObjectURL(blob);
        const filename = `quick-qr-${snapshot.activeType}-${Date.now()}.svg`;
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(dataUrl);
      }
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomLogoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogoSrc(event.target.result as string);
        setLogoType('custom');
        setErrorCorrection('H'); // Auto-upgrade for safety
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="generator-layout">
      
      {/* LEFT COLUMN: Input Configuration & Designing */}
      <div className="lg:col-span-7 space-y-6 min-w-0 w-full" id="generator-configurator">
        
        {/* Dynamic Inputs Form Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm" id="input-container">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <h3 className="font-display text-base font-bold text-slate-900">
              1. Choose Category &amp; Enter Details
            </h3>
            <button 
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition"
              title="Reset configuration defaults"
              id="btn-form-reset"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Form
            </button>
          </div>

          {/* Type Selector Tabs (Moved inside card container) */}
          <div className="mb-6 space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Choose QR Code Category
            </label>
            <div 
              className="bg-slate-50/50 p-2 rounded-2xl border border-slate-100/80 flex flex-nowrap overflow-x-auto gap-1 pb-3 scroll-smooth w-full max-w-full touch-pan-x" 
              style={{ WebkitOverflowScrolling: 'touch' }}
              id="type-tabs"
            >
              {[
                { id: 'url', label: 'Website URL', icon: Globe },
                { id: 'text', label: 'Plain Text', icon: FileText },
                { id: 'vcard', label: 'Contact Card (vCard)', icon: User },
                { id: 'wifi', label: 'WiFi Network', icon: Wifi },
                { id: 'phone', label: 'Phone & SMS', icon: PhoneCall },
                { id: 'email', label: 'Rich Email', icon: Mail },
                { id: 'whatsapp', label: 'WhatsApp Direct', icon: MessageSquare },
                { id: 'social', label: 'Social Handles', icon: Share2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSel = activeType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveType(tab.id as QRType);
                      setGenerateError(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                      isSel 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100/50' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    id={`tab-${tab.id}`}
                  >
                    <Icon className={`h-4 w-4 ${isSel ? 'text-indigo-200 animate-pulse' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields according to activeType */}
          <div className="space-y-4 pt-4 border-t border-slate-100/60">
            {/* Dynamic Input Subheading */}
            <h4 className="font-display text-sm font-bold text-slate-800">
              {activeType === 'url' && 'Enter Website URL'}
              {activeType === 'text' && 'Paste Plain Text Content'}
              {activeType === 'vcard' && 'Provide Contact Information (vCard)'}
              {activeType === 'wifi' && 'Enter WiFi Access Credentials'}
              {activeType === 'phone' && 'Enter Phone or SMS Details'}
              {activeType === 'email' && 'Formulate Automated Email'}
              {activeType === 'whatsapp' && 'Configure WhatsApp Message Link'}
              {activeType === 'social' && 'Select Social Network & Handle'}
            </h4>
            {/* 1. WEBSITE URL INPUT */}
            {activeType === 'url' && (
              <div className="space-y-2">
                <label htmlFor="url-field" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  URL Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                     <Globe className="h-4 w-4 text-indigo-500" />
                  </div>
                  <input
                    type="url"
                    id="url-field"
                    className="block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    placeholder="example.com or https://example.com"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/60 mt-1.5" id="url-input-tip">
                  💡 <strong>URL Format Support:</strong> You can enter the website address with <code>https://</code> (e.g., <code>https://example.com</code>) or without it (e.g., <code>example.com</code>). If entered without <code>https://</code>, we automatically prepend it so your QR code scans flawlessly!
                </p>
              </div>
            )}

            {/* 2. PLAIN TEXT INPUT */}
            {activeType === 'text' && (
              <div className="space-y-2">
                <label htmlFor="text-field" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Raw Text content
                </label>
                <textarea
                  id="text-field"
                  rows={4}
                  className="block w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Type anything here... passwords, paragraphs, system codes, or lists."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>No data is stored. Kept inside browser closure memory.</span>
                  <span className="font-mono">{textInput.length}/1000 characters</span>
                </div>
              </div>
            )}

            {/* 3. WIFI CREDENTIALS INPUT */}
            {activeType === 'wifi' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WiFi Name / SSID */}
                  <div className="space-y-1.5">
                    <label htmlFor="wifi-ssid" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      id="wifi-ssid"
                      required
                      placeholder="My Home WiFi Network"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                    />
                  </div>

                  {/* WiFi Encryption Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="wifi-encryption" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Security/Protocol
                    </label>
                    <select
                      id="wifi-encryption"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as 'WEP' | 'WPA' | 'nopass')}
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                      <option value="WEP">WEP Legacy</option>
                      <option value="nopass">Unsecured / No Password</option>
                    </select>
                  </div>
                </div>

                {/* WiFi Password */}
                {wifiEncryption !== 'nopass' && (
                  <div className="space-y-1.5">
                    <label htmlFor="wifi-pass" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Network Security Password
                    </label>
                    <input
                      type="password"
                      id="wifi-pass"
                      placeholder="••••••••"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                    />
                  </div>
                )}

                {/* Advanced Hidden Network Toggle */}
                <div className="flex items-center space-x-2.5 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="wifi-hidden"
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                  />
                  <label htmlFor="wifi-hidden" className="text-xs text-slate-600 font-medium">
                    This network is hidden (Not broadcasting its SSID)
                  </label>
                </div>
                
                <p className="text-[11px] leading-relaxed text-slate-400">
                  ⚡ When scanned by standard mobile cameras (iOS/Android), the device immediately prompts the user to securely authorize the connection — without having to type complex passwords.
                </p>
              </div>
            )}

            {/* 4. PHONE & SMS INPUT */}
            {activeType === 'phone' && (
              <div className="space-y-4">
                <div className="flex border-b border-slate-100 pb-1">
                  <button
                    type="button"
                    onClick={() => setPhoneType('tel')}
                    className={`flex-1 text-center py-2 text-xs font-semibold uppercase tracking-wider ${
                      phoneType === 'tel' 
                        ? 'text-indigo-600 border-b-2 border-indigo-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Direct Call (tel:)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneType('sms')}
                    className={`flex-1 text-center py-2 text-xs font-semibold uppercase tracking-wider ${
                      phoneType === 'sms' 
                        ? 'text-indigo-600 border-b-2 border-indigo-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Formatted SMS (SMSTO:)
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone-number" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Receiver Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone-number"
                    placeholder="+1 (555) 019-2834"
                    className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                  />
                </div>

                {phoneType === 'sms' && (
                  <div className="space-y-1.5">
                    <label htmlFor="sms-body" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Pre-written Text Message (Optional)
                    </label>
                    <textarea
                      id="sms-body"
                      rows={3}
                      placeholder="Hi, I am interested in your listing"
                      className="block w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={smsMsg}
                      onChange={(e) => setSmsMsg(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 5. EMAIL INPUT */}
            {activeType === 'email' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="email-to" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    id="email-to"
                    required
                    placeholder="contact@business.com"
                    className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email-subject" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    id="email-subject"
                    placeholder="Partnership Inquiry"
                    className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email-body" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Email Body Message
                  </label>
                  <textarea
                    id="email-body"
                    rows={3}
                    placeholder="Dear Quick QR team..."
                    className="block w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* vCARD (CONTACT) INPUT */}
            {activeType === 'vcard' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="vcard-fn" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="vcard-fn"
                      placeholder="Jane"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={vCardFirstName}
                      onChange={(e) => setVCardFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="vcard-ln" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="vcard-ln"
                      placeholder="Doe"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={vCardLastName}
                      onChange={(e) => setVCardLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="vcard-org" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      id="vcard-org"
                      placeholder="Acme Corp"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={vCardOrg}
                      onChange={(e) => setVCardOrg(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="vcard-title" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="vcard-title"
                      placeholder="Product Manager"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={vCardTitle}
                      onChange={(e) => setVCardTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="vcard-phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Work Phone
                    </label>
                    <input
                      type="tel"
                      id="vcard-phone"
                      placeholder="+1 (555) 012-3456"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={vCardPhone}
                      onChange={(e) => setVCardPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="vcard-mobile" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Mobile Phone
                    </label>
                    <input
                      type="tel"
                      id="vcard-mobile"
                      placeholder="+1 (555) 019-8765"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={vCardMobile}
                      onChange={(e) => setVCardMobile(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vcard-email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="vcard-email"
                    placeholder="jane.doe@acme.com"
                    className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={vCardEmail}
                    onChange={(e) => setVCardEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vcard-url" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="vcard-url"
                    placeholder="www.acme.com"
                    className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={vCardUrl}
                    onChange={(e) => setVCardUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="vcard-addr" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Street Address
                  </label>
                  <textarea
                    id="vcard-addr"
                    rows={2}
                    placeholder="123 Science Parkway, Suite 500, San Diego, CA 92121"
                    className="block w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={vCardAddress}
                    onChange={(e) => setVCardAddress(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* WHATSAPP INPUT */}
            {activeType === 'whatsapp' && (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="wa-phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    WhatsApp Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    id="wa-phone"
                    placeholder="15550192834 (do not include +, spaces, or dashes)"
                    className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400">
                    Format: Country code followed by full digits. E.g. **15551234567** for USA, **447911123456** for UK.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wa-msg" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Prefilled Direct Text Message (Optional)
                  </label>
                  <textarea
                    id="wa-msg"
                    rows={3}
                    placeholder="Hi! I scanned your QR code and would like to ask about your services."
                    className="block w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* SOCIAL PROFILE INPUT */}
            {activeType === 'social' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-3 gap-3.5">
                  <div className="col-span-1 space-y-1.5">
                    <label htmlFor="social-platform-sel" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Platform
                    </label>
                    <select
                      id="social-platform-sel"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={socialPlatform}
                      onChange={(e) => setSocialPlatform(e.target.value)}
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="youtube">YouTube</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">X / Twitter</option>
                      <option value="tiktok">TikTok</option>
                      <option value="github">GitHub</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label htmlFor="social-username" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                      Username / Profile Handle
                    </label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 font-medium text-sm font-mono">
                        @
                      </div>
                      <input
                        type="text"
                        id="social-username"
                        placeholder="john_doe"
                        className="block w-full rounded-xl border border-slate-200 py-2.5 pl-8 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        value={socialUsername}
                        onChange={(e) => setSocialUsername(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: QR Code Design & Colors */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6" id="style-customizer-colors">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            2. QR Code Design & Colors
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Foreground color picker */}
              <div className="space-y-1.5">
                <label htmlFor="color-picker-fg" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  QR Dark code
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="color-picker-fg"
                    className="h-9 w-10 shrink-0 rounded-lg border border-slate-200 p-0.5 cursor-pointer"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 h-9 px-2 text-slate-800 uppercase"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                </div>
              </div>

              {/* Background color picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="color-picker-bg" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    QR Light block
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isTransparentBg}
                      onChange={(e) => {
                        setIsTransparentBg(e.target.checked);
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                    />
                    Transparent BG
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="color-picker-bg"
                    className="h-9 w-10 shrink-0 rounded-lg border border-slate-200 p-0.5 cursor-pointer disabled:opacity-40"
                    value={isTransparentBg ? '#ffffff' : bgColor}
                    disabled={isTransparentBg}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="w-full text-xs font-mono rounded-lg border border-slate-200 h-9 px-2 text-slate-800 uppercase disabled:opacity-40"
                    value={isTransparentBg ? 'TRANSPARENT' : bgColor}
                    disabled={isTransparentBg}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Quick Preset Colors */}
            <div className="space-y-2">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Quick Brand Palettes
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2" id="preset-colors">
                {palettes.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setFgColor(p.fg);
                      setBgColor(p.bg);
                    }}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 transition text-[10px] font-medium text-slate-600 text-left"
                  >
                    <span 
                      className="h-3 w-3 rounded shrink-0 border border-slate-300" 
                      style={{ backgroundColor: p.fg }} 
                    />
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Scan Reliability & Resolution Settings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6" id="style-customizer-resolution">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            3. Scan Reliability & Resolution Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="qr-size-sel" className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    Output Resolution Size
                  </label>
                  <span className="text-[10px] bg-indigo-50 font-mono text-indigo-600 px-2.5 py-0.5 rounded-full font-semibold">
                    {qrSize === 'small' && '250 x 250 px'}
                    {qrSize === 'medium' && '400 x 400 px'}
                    {qrSize === 'large' && '650 x 650 px'}
                  </span>
                </div>
                <select
                  id="qr-size-sel"
                  className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={qrSize}
                  onChange={(e) => setQrSize(e.target.value as QRSize)}
                >
                  <option value="small">Small (Best for web placement)</option>
                  <option value="medium">Medium (Standard scannability)</option>
                  <option value="large">Large (High-density print-quality)</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-xs font-medium text-slate-700">Add outer white safety border</span>
                <button
                  type="button"
                  onClick={() => setIncludeMargin(!includeMargin)}
                  className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    includeMargin ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  id="toggle-margin"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      includeMargin ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Error Correction Levels */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="qr-ecc-sel" className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1">
                    Error Correction Level
                    <span className="group relative cursor-help text-slate-400 hover:text-slate-600">
                      <Info className="h-3 w-3" />
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-slate-900 text-[10px] text-white p-2 rounded-lg leading-normal z-20">
                        Higher levels allow the QR code to be read even if partially dirty, damaged, or printed on curved items, but increases visual complexity.
                      </span>
                    </span>
                  </label>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-semibold">
                    {errorCorrection === 'L' && 'Low (7%)'}
                    {errorCorrection === 'M' && 'Medium (15%)'}
                    {errorCorrection === 'Q' && 'Quartile (25%)'}
                    {errorCorrection === 'H' && 'High (30%)'}
                  </span>
                </div>
                <select
                  id="qr-ecc-sel"
                  className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrectionLevel)}
                >
                  <option value="L">L — Clean, low footprint (7%)</option>
                  <option value="M">M — Balanced standard (15%)</option>
                  <option value="Q">Q — Robust scanning (25%)</option>
                  <option value="H">H — Max security / physical prints (30%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Brand Logo Overlay */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4" id="logo-overlay">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            4. Brand Logo Overlay (Center Mark)
          </h3>
          <p className="text-xs text-slate-500 leading-normal">
            Adding a logo can increase scan rates by up to 45% by letting scanners instantly identify your brand. Select a popular preset, or upload your own.
          </p>

          <div className="space-y-4">
            {/* Logo Selectors */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setLogoType('none')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  logoType === 'none'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                No Logo
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoType('preset');
                  setErrorCorrection('H'); // Safety first
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  logoType === 'preset'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Preset Icon
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoType('custom');
                  setErrorCorrection('H');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  logoType === 'custom'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Upload Custom Logo
              </button>
            </div>

            {/* PRESET LOGOS CONTAINER */}
            {logoType === 'preset' && (
              <div className="space-y-2.5 animate-fade-in">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  Select Preset Icon
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'globe', label: 'Web/Globe' },
                    { id: 'wifi', label: 'WiFi' },
                    { id: 'mail', label: 'Mail' },
                    { id: 'link', label: 'Link' },
                    { id: 'phone', label: 'Phone' },
                    { id: 'whatsapp', label: 'WhatsApp' },
                    { id: 'facebook', label: 'Facebook' },
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'youtube', label: 'YouTube' },
                    { id: 'linkedin', label: 'LinkedIn' },
                    { id: 'twitter', label: 'X / Twitter' },
                    { id: 'github', label: 'GitHub' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setLogoPreset(preset.id);
                        setErrorCorrection('H'); // Auto-upgrade for safety
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition truncate text-center cursor-pointer ${
                        logoPreset === preset.id
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOM LOGO LOADER CONTAINER */}
            {logoType === 'custom' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">
                    Upload Custom Image
                  </span>
                  {customLogoSrc && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomLogoSrc(null);
                        setCustomLogoName('');
                        setLogoType('none');
                      }}
                      className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>

                {!customLogoSrc ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-white cursor-pointer hover:bg-slate-50/80 transition-all">
                    <Upload className="h-7 w-7 text-indigo-500 mb-1.5 animate-bounce" />
                    <span className="text-xs font-bold text-slate-700">Choose PNG or JPG file</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Supports transparent backgrounds</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                    <img
                      src={customLogoSrc}
                      alt="Uploaded brand logo"
                      className="h-12 w-12 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate" title={customLogoName}>
                        {customLogoName || 'Uploaded logo'}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        <Check className="h-3.5 w-3.5" />
                        Embedded Successfully
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {logoType !== 'none' && (
              <p className="text-[10px] text-indigo-600 font-semibold bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 leading-relaxed flex items-start gap-1.5 animate-fade-in">
                <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
                <span>
                  **Optimized Scanning Enforced**: We auto-upgraded the scanning level to **High (30% ECC)**. This guarantees your code scans beautifully even with a solid logo in the center.
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: QR Code Generator Output & Download Actions */}
      <div className="lg:col-span-5 relative" id="generator-preview-panel">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md sticky top-24 flex flex-col items-center space-y-5">
          
          <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              QR Generator Panel
            </span>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100/60 font-mono text-[9px] text-yellow-800 font-semibold uppercase">
              <Sparkles className="h-3 w-3" />
              Watermark Free
            </div>
          </div>

          {/* Core Click to Generate Button */}
          <div className="w-full">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-bold text-white shadow-lg transition-all duration-300 transform active:scale-98 cursor-pointer disabled:cursor-wait ${
                isGenerating
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-indigo-100/50 animate-pulse'
                  : isDirty
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 hover:shadow-amber-100 animate-pulse'
                    : !snapshot
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-100'
                      : 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black hover:shadow-slate-100'
              }`}
              id="btn-generate-qr"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-white shrink-0" />
                  <span>Processing... {generationProgress}%</span>
                </>
              ) : (
                <>
                  <QrCode className="h-5 w-5" />
                  <span>{snapshot ? (isDirty ? 'Apply Changes & Re-Generate' : 'QR Code Generated!') : 'Generate QR Code'}</span>
                </>
              )}
            </button>
            {isDirty && !isGenerating && (
              <p className="text-[10px] text-amber-600 font-semibold mt-1.5 text-center animate-fade-in">
                ⚠️ Settings modified — click button to update the QR code below.
              </p>
            )}
          </div>

          {/* QR Canvas Render Container */}
          <div className="relative p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200/80 flex items-center justify-center min-h-[280px] w-full overflow-hidden" id="qr-canvas-holder">
            
            {/* Onboarding Empty State (only when no snapshot exists and not generating) */}
            {!snapshot && !isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3 p-6 animate-fade-in bg-slate-50/80 rounded-2xl">
                <div className="bg-indigo-50 p-3 rounded-full text-indigo-500">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Preview Awaiting Generation</h4>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[210px] leading-relaxed mx-auto">
                    Enter details, customize designs, and click the <strong>Generate QR Code</strong> button above to instantly preview.
                  </p>
                </div>
              </div>
            )}

            {/* Real-Time Processing Loader Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 rounded-2xl animate-fade-in space-y-4">
                <div className="relative flex items-center justify-center h-20 w-20">
                  {/* Outer spinning dash border */}
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                  
                  {/* Pulse background */}
                  <div className="absolute h-14 w-14 rounded-full bg-indigo-50 animate-pulse flex items-center justify-center">
                    <QrCode className="h-7 w-7 text-indigo-600 animate-bounce" />
                  </div>
                </div>
                
                <div className="space-y-2.5 w-full max-w-[240px]">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 font-mono">
                    <span className="text-indigo-600 animate-pulse">⚙️ PROCESS_QR</span>
                    <span>{generationProgress}%</span>
                  </div>
                  
                  {/* Linear Loading Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>

                  <p className="text-[11px] font-bold text-slate-700 animate-pulse truncate h-4" title={generatingStep}>
                    {generatingStep}
                  </p>
                  
                  <div className="text-[9px] text-slate-400 font-mono flex items-center justify-center gap-1 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Real-time Reed-Solomon Encoding</span>
                  </div>
                </div>
              </div>
            )}

            {/* The actual canvas container, visible only after generation */}
            <div className={`relative bg-white p-4.5 rounded-xl shadow-md border border-slate-100 max-w-full transition-all duration-300 ${(!snapshot || isGenerating) ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
              <canvas 
                ref={canvasRef} 
                className="mx-auto rounded font-mono select-none pointer-events-none max-w-full h-auto object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Error Overlay */}
            {generateError && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 rounded-2xl">
                <AlertCircle className="h-9 w-9 text-red-500 mb-2.5" />
                <h4 className="text-sm font-bold text-slate-900">Encoding Overflow Warning</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1 max-w-xs">
                  The current length of raw data exceeds maximum size. Try switching down the **Error Correction Level** to Low or trimming text.
                </p>
              </div>
            )}
          </div>

          {/* Download & Copy Panel - only active/shown when snapshot exists */}
          <div className={`w-full space-y-3 transition-all duration-300 ${(!snapshot || isGenerating) ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`} id="qr-actions">
            
            {/* Download Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                disabled={!!generateError || !snapshot}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-xs font-semibold text-white shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
                id="btn-download-png"
              >
                <Download className="h-4 w-4" />
                Download PNG (Web)
              </button>

              <button
                onClick={handleDownloadSvg}
                disabled={!!generateError || !snapshot}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-xs font-semibold text-white shadow-lg hover:shadow-slate-900/10 transition-all duration-300 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                id="btn-download-svg"
              >
                <FileCode className="h-4 w-4 text-slate-400" />
                Download SVG (Print)
              </button>
            </div>

            {/* Copy to clipboard & clear options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyClipboard}
                disabled={!!generateError || !snapshot}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                  isCopied 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : isCopyFailed 
                      ? 'bg-amber-50 border-amber-200 text-amber-800' 
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Copy QR generated image to browser clipboard"
                id="btn-copy-clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-400 shrink-0" />
                    Copy Image
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  handleReset();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                id="btn-qr-reset-all"
              >
                <RotateCcw className="h-4 w-4 text-slate-400 shrink-0" />
                Clear Form
              </button>
            </div>
            
            {isCopyFailed && (
              <p className="text-[10px] text-amber-600 text-center animate-pulse leading-snug">
                Web security restrictions blocked direct clip image writing. Please use the direct download button instead.
              </p>
            )}

            {/* Privacy Trust Stamp */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center uppercase font-mono tracking-wider font-semibold">
              <QrCode className="h-3 w-3 text-slate-300" />
              Universal Scannable Format | 100% Client-Side Secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
