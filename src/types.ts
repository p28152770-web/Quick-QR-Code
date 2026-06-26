export type PageId = 'home' | 'scanner' | 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | '404' | '500';

export type QRType = 'url' | 'text' | 'phone' | 'email' | 'wifi' | 'vcard' | 'whatsapp' | 'social';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QRSize = 'small' | 'medium' | 'large';

export interface WiFiConfig {
  ssid: string;
  password?: string;
  encryption: 'WEP' | 'WPA' | 'nopass';
  hidden: boolean;
}

export interface QRConfig {
  type: QRType;
  value: string; // The raw data encoded
  size: QRSize;
  errorCorrectionLevel: ErrorCorrectionLevel;
  fgColor: string; // Hex color for modules
  bgColor: string; // Hex color for background
  includeMargin: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}
