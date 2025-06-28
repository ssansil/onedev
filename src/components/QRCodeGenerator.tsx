import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, QrCode, Download, Upload, X, Palette, Image as ImageIcon, Type, Frame, Zap, Info, Eye, Settings, RefreshCw, Wifi, User, Phone, Mail, MapPin, Calendar, CreditCard, MessageSquare } from 'lucide-react';
import QRCodeLib from 'qrcode';

interface QRCodeData {
  type: 'url' | 'text' | 'wifi' | 'vcard' | 'sms' | 'email' | 'phone' | 'location' | 'event' | 'payment';
  text: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  
  // Frame options
  frameStyle: 'none' | 'square' | 'rounded' | 'circle' | 'hexagon' | 'modern' | 'scan-me' | 'custom-text' | 'gradient' | 'shadow';
  frameColor: string;
  frameWidth: number;
  frameText: string;
  frameTextSize: number;
  frameTextColor: string;
  frameGradientStart: string;
  frameGradientEnd: string;
  frameShadow: boolean;
  
  // Logo options
  logoUrl: string;
  logoSize: number;
  logoBackground: boolean;
  logoBackgroundColor: string;
  logoCornerRadius: number;

  // Type-specific data
  url: string;
  plainText: string;
  wifiSSID: string;
  wifiPassword: string;
  wifiSecurity: 'WPA' | 'WEP' | 'nopass';
  wifiHidden: boolean;
  vcardName: string;
  vcardPhone: string;
  vcardEmail: string;
  vcardOrganization: string;
  vcardUrl: string;
  smsNumber: string;
  smsMessage: string;
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  phoneNumber: string;
  locationLat: string;
  locationLng: string;
  locationName: string;
  eventTitle: string;
  eventLocation: string;
  eventStartDate: string;
  eventEndDate: string;
  eventDescription: string;
  paymentAmount: string;
  paymentCurrency: string;
  paymentDescription: string;
  paymentPixKey: string;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'favicon' | 'image';
}

const QRCodeGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'colors' | 'frame' | 'logo' | 'preview'>('generator');
  const [qrData, setQrData] = useState<QRCodeData>({
    type: 'url',
    text: '',
    size: 300,
    errorCorrectionLevel: 'M',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    margin: 4,
    
    frameStyle: 'none',
    frameColor: '#000000',
    frameWidth: 20,
    frameText: 'SCAN ME',
    frameTextSize: 16,
    frameTextColor: '#ffffff',
    frameGradientStart: '#3b82f6',
    frameGradientEnd: '#8b5cf6',
    frameShadow: false,
    
    logoUrl: '',
    logoSize: 20,
    logoBackground: false,
    logoBackgroundColor: '#ffffff',
    logoCornerRadius: 8,

    // Type-specific defaults
    url: '',
    plainText: '',
    wifiSSID: '',
    wifiPassword: '',
    wifiSecurity: 'WPA',
    wifiHidden: false,
    vcardName: '',
    vcardPhone: '',
    vcardEmail: '',
    vcardOrganization: '',
    vcardUrl: '',
    smsNumber: '',
    smsMessage: '',
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    phoneNumber: '',
    locationLat: '',
    locationLng: '',
    locationName: '',
    eventTitle: '',
    eventLocation: '',
    eventStartDate: '',
    eventEndDate: '',
    eventDescription: '',
    paymentAmount: '',
    paymentCurrency: 'BRL',
    paymentDescription: '',
    paymentPixKey: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [copied, setCopied] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR Code types
  const qrTypes = [
    { id: 'url', name: 'URL/Website', icon: QrCode, description: 'Link para site ou página web' },
    { id: 'text', name: 'Texto Simples', icon: Type, description: 'Texto puro sem formatação' },
    { id: 'wifi', name: 'WiFi', icon: Wifi, description: 'Credenciais de rede WiFi' },
    { id: 'vcard', name: 'Contato (vCard)', icon: User, description: 'Informações de contato' },
    { id: 'sms', name: 'SMS', icon: MessageSquare, description: 'Mensagem de texto pré-definida' },
    { id: 'email', name: 'Email', icon: Mail, description: 'Endereço de email com assunto' },
    { id: 'phone', name: 'Telefone', icon: Phone, description: 'Número de telefone para ligação' },
    { id: 'location', name: 'Localização', icon: MapPin, description: 'Coordenadas GPS ou endereço' },
    { id: 'event', name: 'Evento', icon: Calendar, description: 'Evento de calendário' },
    { id: 'payment', name: 'PIX/Pagamento', icon: CreditCard, description: 'Chave PIX ou dados de pagamento' }
  ];

  // Predefined color presets
  const colorPresets = [
    { name: 'Clássico', fg: '#000000', bg: '#ffffff' },
    { name: 'Azul', fg: '#1e40af', bg: '#dbeafe' },
    { name: 'Verde', fg: '#166534', bg: '#dcfce7' },
    { name: 'Roxo', fg: '#7c3aed', bg: '#ede9fe' },
    { name: 'Vermelho', fg: '#dc2626', bg: '#fee2e2' },
    { name: 'Laranja', fg: '#ea580c', bg: '#fed7aa' },
    { name: 'Rosa', fg: '#e11d48', bg: '#fce7f3' },
    { name: 'Escuro', fg: '#ffffff', bg: '#1f2937' }
  ];

  const framePresets = [
    { name: 'Preto', color: '#000000' },
    { name: 'Azul', color: '#3b82f6' },
    { name: 'Verde', color: '#10b981' },
    { name: 'Roxo', color: '#8b5cf6' },
    { name: 'Vermelho', color: '#ef4444' },
    { name: 'Laranja', color: '#f97316' },
    { name: 'Rosa', color: '#ec4899' },
    { name: 'Dourado', color: '#f59e0b' }
  ];

  // Generate QR content based on type
  const generateQRContent = useCallback(() => {
    switch (qrData.type) {
      case 'url':
        return qrData.url;
      
      case 'text':
        return qrData.plainText;
      
      case 'wifi':
        return `WIFI:T:${qrData.wifiSecurity};S:${qrData.wifiSSID};P:${qrData.wifiPassword};H:${qrData.wifiHidden ? 'true' : 'false'};;`;
      
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:${qrData.vcardName}
ORG:${qrData.vcardOrganization}
TEL:${qrData.vcardPhone}
EMAIL:${qrData.vcardEmail}
URL:${qrData.vcardUrl}
END:VCARD`;
      
      case 'sms':
        return `sms:${qrData.smsNumber}?body=${encodeURIComponent(qrData.smsMessage)}`;
      
      case 'email':
        return `mailto:${qrData.emailTo}?subject=${encodeURIComponent(qrData.emailSubject)}&body=${encodeURIComponent(qrData.emailBody)}`;
      
      case 'phone':
        return `tel:${qrData.phoneNumber}`;
      
      case 'location':
        if (qrData.locationLat && qrData.locationLng) {
          return `geo:${qrData.locationLat},${qrData.locationLng}${qrData.locationName ? `?q=${encodeURIComponent(qrData.locationName)}` : ''}`;
        }
        return qrData.locationName;
      
      case 'event':
        const startDate = qrData.eventStartDate ? new Date(qrData.eventStartDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
        const endDate = qrData.eventEndDate ? new Date(qrData.eventEndDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '';
        
        return `BEGIN:VEVENT
SUMMARY:${qrData.eventTitle}
LOCATION:${qrData.eventLocation}
DTSTART:${startDate}
DTEND:${endDate}
DESCRIPTION:${qrData.eventDescription}
END:VEVENT`;
      
      case 'payment':
        if (qrData.paymentPixKey) {
          // Formato PIX simplificado
          return `PIX:${qrData.paymentPixKey}${qrData.paymentAmount ? `:${qrData.paymentAmount}` : ''}${qrData.paymentDescription ? `:${qrData.paymentDescription}` : ''}`;
        }
        return `${qrData.paymentPixKey}`;
      
      default:
        return qrData.text;
    }
  }, [qrData]);

  const generateQRCode = useCallback(async () => {
    const content = generateQRContent();
    
    if (!content.trim()) {
      setQrCodeDataURL('');
      return;
    }

    try {
      // Generate base QR code
      const qrCodeDataUrl = await QRCodeLib.toDataURL(content, {
        width: qrData.size,
        margin: qrData.margin,
        color: {
          dark: qrData.foregroundColor,
          light: qrData.backgroundColor
        },
        errorCorrectionLevel: qrData.errorCorrectionLevel
      });

      // Create canvas for composition
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate frame dimensions
      const frameWidth = qrData.frameStyle !== 'none' ? qrData.frameWidth : 0;
      const totalSize = qrData.size + (frameWidth * 2);
      
      canvas.width = totalSize;
      canvas.height = totalSize;

      // Clear canvas
      ctx.clearRect(0, 0, totalSize, totalSize);

      // Draw frame
      if (qrData.frameStyle !== 'none') {
        await drawFrame(ctx, totalSize, frameWidth);
      }

      // Draw QR code
      const qrImage = new Image();
      qrImage.onload = async () => {
        ctx.drawImage(qrImage, frameWidth, frameWidth, qrData.size, qrData.size);

        // Draw logo if provided
        if (qrData.logoUrl) {
          await drawLogo(ctx, frameWidth);
        }

        // Convert to data URL
        const finalDataURL = canvas.toDataURL('image/png');
        setQrCodeDataURL(finalDataURL);
      };
      qrImage.src = qrCodeDataUrl;

    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }, [qrData, generateQRContent]);

  const drawFrame = useCallback(async (ctx: CanvasRenderingContext2D, totalSize: number, frameWidth: number) => {
    const centerX = totalSize / 2;
    const centerY = totalSize / 2;

    // Save context
    ctx.save();

    // Apply shadow if enabled
    if (qrData.frameShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
    }

    switch (qrData.frameStyle) {
      case 'square':
        ctx.fillStyle = qrData.frameColor;
        ctx.fillRect(0, 0, totalSize, frameWidth); // Top
        ctx.fillRect(0, totalSize - frameWidth, totalSize, frameWidth); // Bottom
        ctx.fillRect(0, 0, frameWidth, totalSize); // Left
        ctx.fillRect(totalSize - frameWidth, 0, frameWidth, totalSize); // Right
        break;

      case 'rounded':
        const radius = 20;
        ctx.fillStyle = qrData.frameColor;
        
        // Draw rounded rectangle frame
        ctx.beginPath();
        ctx.roundRect(0, 0, totalSize, totalSize, radius);
        ctx.roundRect(frameWidth, frameWidth, totalSize - frameWidth * 2, totalSize - frameWidth * 2, radius - frameWidth);
        ctx.fill('evenodd');
        break;

      case 'circle':
        const outerRadius = totalSize / 2;
        const innerRadius = outerRadius - frameWidth;
        
        ctx.fillStyle = qrData.frameColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fill('evenodd');
        break;

      case 'hexagon':
        drawHexagonFrame(ctx, centerX, centerY, totalSize / 2, frameWidth);
        break;

      case 'modern':
        drawModernFrame(ctx, totalSize, frameWidth);
        break;

      case 'scan-me':
        drawScanMeFrame(ctx, totalSize, frameWidth);
        break;

      case 'custom-text':
        drawCustomTextFrame(ctx, totalSize, frameWidth);
        break;

      case 'gradient':
        drawGradientFrame(ctx, totalSize, frameWidth);
        break;

      case 'shadow':
        drawShadowFrame(ctx, totalSize, frameWidth);
        break;
    }

    // Restore context
    ctx.restore();
  }, [qrData]);

  const drawHexagonFrame = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, outerRadius: number, frameWidth: number) => {
    const innerRadius = outerRadius - frameWidth;
    
    ctx.fillStyle = qrData.frameColor;
    ctx.beginPath();
    
    // Outer hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + outerRadius * Math.cos(angle);
      const y = centerY + outerRadius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    // Inner hexagon (hole)
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + innerRadius * Math.cos(angle);
      const y = centerY + innerRadius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    ctx.fill('evenodd');
  };

  const drawModernFrame = (ctx: CanvasRenderingContext2D, totalSize: number, frameWidth: number) => {
    const cutSize = 30;
    
    ctx.fillStyle = qrData.frameColor;
    
    // Top border with cuts
    ctx.beginPath();
    ctx.moveTo(cutSize, 0);
    ctx.lineTo(totalSize - cutSize, 0);
    ctx.lineTo(totalSize, cutSize);
    ctx.lineTo(totalSize, frameWidth);
    ctx.lineTo(frameWidth, frameWidth);
    ctx.lineTo(frameWidth, cutSize);
    ctx.closePath();
    ctx.fill();
    
    // Bottom border with cuts
    ctx.beginPath();
    ctx.moveTo(0, totalSize - cutSize);
    ctx.lineTo(cutSize, totalSize);
    ctx.lineTo(totalSize - cutSize, totalSize);
    ctx.lineTo(totalSize, totalSize - cutSize);
    ctx.lineTo(totalSize, totalSize - frameWidth);
    ctx.lineTo(frameWidth, totalSize - frameWidth);
    ctx.lineTo(frameWidth, totalSize - cutSize);
    ctx.lineTo(0, totalSize - cutSize);
    ctx.closePath();
    ctx.fill();
    
    // Left border
    ctx.fillRect(0, cutSize, frameWidth, totalSize - cutSize * 2);
    
    // Right border
    ctx.fillRect(totalSize - frameWidth, cutSize, frameWidth, totalSize - cutSize * 2);
  };

  const drawScanMeFrame = (ctx: CanvasRenderingContext2D, totalSize: number, frameWidth: number) => {
    // Draw base frame
    ctx.fillStyle = qrData.frameColor;
    ctx.fillRect(0, 0, totalSize, frameWidth); // Top
    ctx.fillRect(0, totalSize - frameWidth, totalSize, frameWidth); // Bottom
    ctx.fillRect(0, 0, frameWidth, totalSize); // Left
    ctx.fillRect(totalSize - frameWidth, 0, frameWidth, totalSize); // Right
    
    // Add "SCAN ME" text at bottom
    ctx.fillStyle = qrData.frameTextColor;
    ctx.font = `bold ${qrData.frameTextSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textY = totalSize - frameWidth / 2;
    ctx.fillText('SCAN ME', totalSize / 2, textY);
  };

  const drawCustomTextFrame = (ctx: CanvasRenderingContext2D, totalSize: number, frameWidth: number) => {
    // Draw base frame
    ctx.fillStyle = qrData.frameColor;
    ctx.fillRect(0, 0, totalSize, frameWidth); // Top
    ctx.fillRect(0, totalSize - frameWidth, totalSize, frameWidth); // Bottom
    ctx.fillRect(0, 0, frameWidth, totalSize); // Left
    ctx.fillRect(totalSize - frameWidth, 0, frameWidth, totalSize); // Right
    
    // Add custom text at bottom
    if (qrData.frameText.trim()) {
      ctx.fillStyle = qrData.frameTextColor;
      ctx.font = `bold ${qrData.frameTextSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textY = totalSize - frameWidth / 2;
      ctx.fillText(qrData.frameText.toUpperCase(), totalSize / 2, textY);
    }
  };

  const drawGradientFrame = (ctx: CanvasRenderingContext2D, totalSize: number, frameWidth: number) => {
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, totalSize, totalSize);
    gradient.addColorStop(0, qrData.frameGradientStart);
    gradient.addColorStop(1, qrData.frameGradientEnd);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, totalSize, frameWidth); // Top
    ctx.fillRect(0, totalSize - frameWidth, totalSize, frameWidth); // Bottom
    ctx.fillRect(0, 0, frameWidth, totalSize); // Left
    ctx.fillRect(totalSize - frameWidth, 0, frameWidth, totalSize); // Right
  };

  const drawShadowFrame = (ctx: CanvasRenderingContext2D, totalSize: number, frameWidth: number) => {
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(5, 5, totalSize - 5, frameWidth); // Top shadow
    ctx.fillRect(5, totalSize - frameWidth, totalSize - 5, frameWidth); // Bottom shadow
    ctx.fillRect(5, 5, frameWidth, totalSize - 5); // Left shadow
    ctx.fillRect(totalSize - frameWidth, 5, frameWidth, totalSize - 5); // Right shadow
    
    // Draw main frame
    ctx.fillStyle = qrData.frameColor;
    ctx.fillRect(0, 0, totalSize, frameWidth); // Top
    ctx.fillRect(0, totalSize - frameWidth, totalSize, frameWidth); // Bottom
    ctx.fillRect(0, 0, frameWidth, totalSize); // Left
    ctx.fillRect(totalSize - frameWidth, 0, frameWidth, totalSize); // Right
  };

  const drawLogo = useCallback(async (ctx: CanvasRenderingContext2D, frameOffset: number) => {
    return new Promise<void>((resolve) => {
      const logoImage = new Image();
      logoImage.crossOrigin = 'anonymous';
      
      logoImage.onload = () => {
        const logoPixelSize = (qrData.size * qrData.logoSize) / 100;
        const logoX = frameOffset + (qrData.size - logoPixelSize) / 2;
        const logoY = frameOffset + (qrData.size - logoPixelSize) / 2;

        // Draw logo background if enabled
        if (qrData.logoBackground) {
          ctx.fillStyle = qrData.logoBackgroundColor;
          if (qrData.logoCornerRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(
              logoX - 5,
              logoY - 5,
              logoPixelSize + 10,
              logoPixelSize + 10,
              qrData.logoCornerRadius
            );
            ctx.fill();
          } else {
            ctx.fillRect(logoX - 5, logoY - 5, logoPixelSize + 10, logoPixelSize + 10);
          }
        }

        // Draw logo with rounded corners if specified
        if (qrData.logoCornerRadius > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(logoX, logoY, logoPixelSize, logoPixelSize, qrData.logoCornerRadius);
          ctx.clip();
        }

        ctx.drawImage(logoImage, logoX, logoY, logoPixelSize, logoPixelSize);

        if (qrData.logoCornerRadius > 0) {
          ctx.restore();
        }

        resolve();
      };

      logoImage.onerror = () => resolve();
      logoImage.src = qrData.logoUrl;
    });
  }, [qrData]);

  // Generate QR code when data changes
  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const updateField = useCallback((field: keyof QRCodeData, value: any) => {
    setQrData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'favicon' | 'image') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Limite máximo: 5MB');
        return;
      }

      const url = URL.createObjectURL(file);
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        url,
        type
      };
      
      setUploadedFiles(prev => [...prev, uploadedFile]);
      updateField('logoUrl', url);
    }
  };

  const removeUploadedFile = (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (file) {
      URL.revokeObjectURL(file.url);
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
      
      if (qrData.logoUrl === file.url) {
        updateField('logoUrl', '');
      }
    }
  };

  const copyToClipboard = async () => {
    if (!qrCodeDataURL) return;
    
    try {
      const response = await fetch(qrCodeDataURL);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return;
    
    const link = document.createElement('a');
    link.download = `qrcode-${qrData.type}.png`;
    link.href = qrCodeDataURL;
    link.click();
  };

  const loadSample = () => {
    updateField('type', 'url');
    updateField('url', 'https://onedev.agencione.com.br');
    updateField('frameStyle', 'scan-me');
    updateField('frameColor', '#3b82f6');
    updateField('frameTextColor', '#ffffff');
  };

  const clearAll = () => {
    setQrData({
      type: 'url',
      text: '',
      size: 300,
      errorCorrectionLevel: 'M',
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      margin: 4,
      frameStyle: 'none',
      frameColor: '#000000',
      frameWidth: 20,
      frameText: 'SCAN ME',
      frameTextSize: 16,
      frameTextColor: '#ffffff',
      frameGradientStart: '#3b82f6',
      frameGradientEnd: '#8b5cf6',
      frameShadow: false,
      logoUrl: '',
      logoSize: 20,
      logoBackground: false,
      logoBackgroundColor: '#ffffff',
      logoCornerRadius: 8,
      url: '',
      plainText: '',
      wifiSSID: '',
      wifiPassword: '',
      wifiSecurity: 'WPA',
      wifiHidden: false,
      vcardName: '',
      vcardPhone: '',
      vcardEmail: '',
      vcardOrganization: '',
      vcardUrl: '',
      smsNumber: '',
      smsMessage: '',
      emailTo: '',
      emailSubject: '',
      emailBody: '',
      phoneNumber: '',
      locationLat: '',
      locationLng: '',
      locationName: '',
      eventTitle: '',
      eventLocation: '',
      eventStartDate: '',
      eventEndDate: '',
      eventDescription: '',
      paymentAmount: '',
      paymentCurrency: 'BRL',
      paymentDescription: '',
      paymentPixKey: ''
    });
    setUploadedFiles([]);
  };

  const InfoCard = ({ title, description }: { title: string; description: string }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-900 mb-1">{title}</h4>
          <p className="text-xs text-blue-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'generator', name: 'Gerador', icon: QrCode },
    { id: 'colors', name: 'Cores', icon: Palette },
    { id: 'frame', name: 'Frame', icon: Frame },
    { id: 'logo', name: 'Logo', icon: ImageIcon },
    { id: 'preview', name: 'Preview', icon: Eye }
  ];

  const renderTypeSpecificFields = () => {
    switch (qrData.type) {
      case 'url':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Website
            </label>
            <input
              type="url"
              value={qrData.url}
              onChange={(e) => updateField('url', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://exemplo.com"
            />
          </div>
        );

      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto
            </label>
            <textarea
              value={qrData.plainText}
              onChange={(e) => updateField('plainText', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Digite seu texto aqui..."
            />
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Rede (SSID)
                </label>
                <input
                  type="text"
                  value={qrData.wifiSSID}
                  onChange={(e) => updateField('wifiSSID', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="MinhaRede"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={qrData.wifiPassword}
                  onChange={(e) => updateField('wifiPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="senha123"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Segurança
                </label>
                <select
                  value={qrData.wifiSecurity}
                  onChange={(e) => updateField('wifiSecurity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Sem senha</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={qrData.wifiHidden}
                    onChange={(e) => updateField('wifiHidden', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Rede oculta</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={qrData.vcardName}
                  onChange={(e) => updateField('vcardName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="João Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organização
                </label>
                <input
                  type="text"
                  value={qrData.vcardOrganization}
                  onChange={(e) => updateField('vcardOrganization', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Minha Empresa"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={qrData.vcardPhone}
                  onChange={(e) => updateField('vcardPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+55 11 99999-9999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={qrData.vcardEmail}
                  onChange={(e) => updateField('vcardEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="joao@exemplo.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={qrData.vcardUrl}
                onChange={(e) => updateField('vcardUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://meusite.com"
              />
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Telefone
              </label>
              <input
                type="tel"
                value={qrData.smsNumber}
                onChange={(e) => updateField('smsNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="+55 11 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem
              </label>
              <textarea
                value={qrData.smsMessage}
                onChange={(e) => updateField('smsMessage', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Olá! Como você está?"
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Destino
              </label>
              <input
                type="email"
                value={qrData.emailTo}
                onChange={(e) => updateField('emailTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="contato@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assunto
              </label>
              <input
                type="text"
                value={qrData.emailSubject}
                onChange={(e) => updateField('emailSubject', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Assunto do email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem
              </label>
              <textarea
                value={qrData.emailBody}
                onChange={(e) => updateField('emailBody', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Corpo do email..."
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número do Telefone
            </label>
            <input
              type="tel"
              value={qrData.phoneNumber}
              onChange={(e) => updateField('phoneNumber', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="+55 11 99999-9999"
            />
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Local
              </label>
              <input
                type="text"
                value={qrData.locationName}
                onChange={(e) => updateField('locationName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Minha Empresa"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  value={qrData.locationLat}
                  onChange={(e) => updateField('locationLat', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="-23.5505"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  value={qrData.locationLng}
                  onChange={(e) => updateField('locationLng', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="-46.6333"
                />
              </div>
            </div>
          </div>
        );

      case 'event':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Evento
              </label>
              <input
                type="text"
                value={qrData.eventTitle}
                onChange={(e) => updateField('eventTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Reunião de Trabalho"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local
              </label>
              <input
                type="text"
                value={qrData.eventLocation}
                onChange={(e) => updateField('eventLocation', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Sala de Reuniões"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data/Hora Início
                </label>
                <input
                  type="datetime-local"
                  value={qrData.eventStartDate}
                  onChange={(e) => updateField('eventStartDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data/Hora Fim
                </label>
                <input
                  type="datetime-local"
                  value={qrData.eventEndDate}
                  onChange={(e) => updateField('eventEndDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={qrData.eventDescription}
                onChange={(e) => updateField('eventDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Descrição do evento..."
              />
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave PIX
              </label>
              <input
                type="text"
                value={qrData.paymentPixKey}
                onChange={(e) => updateField('paymentPixKey', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="usuario@email.com ou CPF/CNPJ"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={qrData.paymentAmount}
                  onChange={(e) => updateField('paymentAmount', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moeda
                </label>
                <select
                  value={qrData.paymentCurrency}
                  onChange={(e) => updateField('paymentCurrency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="BRL">Real (BRL)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={qrData.paymentDescription}
                onChange={(e) => updateField('paymentDescription', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Pagamento de produto/serviço"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderGeneratorTab = () => (
    <div className="space-y-6">
      {/* QR Code Type Selection */}
      <div>
        <InfoCard 
          title="Tipo de QR Code"
          description="Selecione o tipo de conteúdo que deseja codificar. Cada tipo tem campos específicos para facilitar a criação."
        />
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de QR Code
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {qrTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => updateField('type', type.id)}
                className={`p-3 border-2 rounded-lg transition-all text-left ${
                  qrData.type === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={type.description}
              >
                <Icon className="w-6 h-6 mb-2 mx-auto" />
                <div className="text-xs font-medium text-center">{type.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Type-specific fields */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {qrTypes.find(t => t.id === qrData.type)?.name} - Configuração
        </h3>
        {renderTypeSpecificFields()}
      </div>

      {/* QR Code Settings */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Configurações do QR Code</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamanho: {qrData.size}px
            </label>
            <input
              type="range"
              min="200"
              max="800"
              value={qrData.size}
              onChange={(e) => updateField('size', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margem: {qrData.margin}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={qrData.margin}
              onChange={(e) => updateField('margin', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correção de Erro
          </label>
          <select
            value={qrData.errorCorrectionLevel}
            onChange={(e) => updateField('errorCorrectionLevel', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="L">Baixa (~7%)</option>
            <option value="M">Média (~15%)</option>
            <option value="Q">Alta (~25%) - Recomendado com logo</option>
            <option value="H">Muito Alta (~30%)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-6">
      <div>
        <InfoCard 
          title="Cores do QR Code"
          description="Personalize as cores do QR Code. Mantenha bom contraste entre foreground e background para garantir a leitura."
        />
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor Principal (Foreground)
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={qrData.foregroundColor}
                onChange={(e) => updateField('foregroundColor', e.target.value)}
                className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={qrData.foregroundColor}
                onChange={(e) => updateField('foregroundColor', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor de Fundo (Background)
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={qrData.backgroundColor}
                onChange={(e) => updateField('backgroundColor', e.target.value)}
                className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={qrData.backgroundColor}
                onChange={(e) => updateField('backgroundColor', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Presets de Cores</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                updateField('foregroundColor', preset.fg);
                updateField('backgroundColor', preset.bg);
              }}
              className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex gap-2 mb-2">
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: preset.fg }}
                />
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: preset.bg }}
                />
              </div>
              <div className="text-xs text-gray-600">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFrameTab = () => (
    <div className="space-y-6">
      <div>
        <InfoCard 
          title="Frames Decorativos"
          description="Adicione frames estilizados ao seu QR Code. Frames com texto são ideais para chamadas de ação como 'SCAN ME'."
        />
        
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Estilo do Frame
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { id: 'none', name: 'Sem Frame' },
            { id: 'square', name: 'Quadrado' },
            { id: 'rounded', name: 'Arredondado' },
            { id: 'circle', name: 'Circular' },
            { id: 'hexagon', name: 'Hexágono' },
            { id: 'modern', name: 'Moderno' },
            { id: 'scan-me', name: 'Scan Me' },
            { id: 'custom-text', name: 'Texto Custom' },
            { id: 'gradient', name: 'Gradiente' },
            { id: 'shadow', name: 'Com Sombra' }
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => updateField('frameStyle', style.id)}
              className={`p-3 border-2 rounded-lg transition-all text-left ${
                qrData.frameStyle === style.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">{style.name}</div>
            </button>
          ))}
        </div>
      </div>

      {qrData.frameStyle !== 'none' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Espessura do Frame: {qrData.frameWidth}px
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={qrData.frameWidth}
              onChange={(e) => updateField('frameWidth', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {qrData.frameStyle === 'gradient' ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Inicial do Gradiente
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={qrData.frameGradientStart}
                    onChange={(e) => updateField('frameGradientStart', e.target.value)}
                    className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrData.frameGradientStart}
                    onChange={(e) => updateField('frameGradientStart', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Final do Gradiente
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={qrData.frameGradientEnd}
                    onChange={(e) => updateField('frameGradientEnd', e.target.value)}
                    className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrData.frameGradientEnd}
                    onChange={(e) => updateField('frameGradientEnd', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor do Frame
              </label>
              <div className="flex gap-3 mb-4">
                <input
                  type="color"
                  value={qrData.frameColor}
                  onChange={(e) => updateField('frameColor', e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={qrData.frameColor}
                  onChange={(e) => updateField('frameColor', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="#000000"
                />
              </div>

              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {framePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateField('frameColor', preset.color)}
                    className="w-full aspect-square rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          )}

          {(qrData.frameStyle === 'scan-me' || qrData.frameStyle === 'custom-text') && (
            <div className="space-y-4">
              {qrData.frameStyle === 'custom-text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Frame
                  </label>
                  <input
                    type="text"
                    value={qrData.frameText}
                    onChange={(e) => updateField('frameText', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Digite o texto do frame..."
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho do Texto: {qrData.frameTextSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={qrData.frameTextSize}
                    onChange={(e) => updateField('frameTextSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor do Texto
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={qrData.frameTextColor}
                      onChange={(e) => updateField('frameTextColor', e.target.value)}
                      className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrData.frameTextColor}
                      onChange={(e) => updateField('frameTextColor', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderLogoTab = () => (
    <div className="space-y-6">
      <div>
        <InfoCard 
          title="Logo Central"
          description="Adicione um logo no centro do QR Code. Use correção de erro Alta (Q) ou Muito Alta (H) para garantir que o QR Code continue legível."
        />
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload de Logo
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e, 'image')}
                accept=".png,.jpg,.jpeg,.svg,.webp"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">Selecionar Logo</span>
              </button>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, SVG, WebP (até 5MB)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Logo (alternativa)
              </label>
              <input
                type="url"
                value={qrData.logoUrl}
                onChange={(e) => updateField('logoUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Logos Enviados:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeUploadedFile(file.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateField('logoUrl', file.url)}
                      className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center"
                    >
                      <span className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
                        Usar
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {qrData.logoUrl && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamanho do Logo: {qrData.logoSize}%
            </label>
            <input
              type="range"
              min="10"
              max="30"
              value={qrData.logoSize}
              onChange={(e) => updateField('logoSize', parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recomendado: máximo 25% para manter a legibilidade
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={qrData.logoBackground}
                onChange={(e) => updateField('logoBackground', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Adicionar fundo ao logo
              </span>
            </label>
          </div>

          {qrData.logoBackground && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Fundo
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={qrData.logoBackgroundColor}
                    onChange={(e) => updateField('logoBackgroundColor', e.target.value)}
                    className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={qrData.logoBackgroundColor}
                    onChange={(e) => updateField('logoBackgroundColor', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arredondamento: {qrData.logoCornerRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={qrData.logoCornerRadius}
                  onChange={(e) => updateField('logoCornerRadius', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Preview do QR Code</h3>
        
        {qrCodeDataURL ? (
          <div className="inline-block">
            <img 
              src={qrCodeDataURL} 
              alt="QR Code gerado" 
              className="max-w-full h-auto border border-gray-200 rounded-lg shadow-lg"
              style={{ maxHeight: '400px' }}
            />
            
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Imagem
                  </>
                )}
              </button>
              
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                Download PNG
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <QrCode className="w-16 h-16 mb-4" />
            <p>Configure o QR Code na aba "Gerador" para ver o preview</p>
          </div>
        )}
      </div>

      {generateQRContent() && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Informações do QR Code</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tipo:</span>
              <p className="font-medium text-gray-800 mt-1">
                {qrTypes.find(t => t.id === qrData.type)?.name}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Conteúdo:</span>
              <p className="font-mono text-xs bg-white p-2 rounded border mt-1 break-all max-h-20 overflow-y-auto">
                {generateQRContent()}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Configurações:</span>
              <ul className="text-xs text-gray-700 mt-1 space-y-1">
                <li>• Tamanho: {qrData.size}px</li>
                <li>• Correção: {qrData.errorCorrectionLevel}</li>
                <li>• Frame: {qrData.frameStyle}</li>
                <li>• Logo: {qrData.logoUrl ? 'Sim' : 'Não'}</li>
              </ul>
            </div>
            <div>
              <span className="text-gray-600">Cores:</span>
              <div className="flex gap-2 mt-1">
                <div 
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: qrData.foregroundColor }}
                  title="Cor principal"
                />
                <div 
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: qrData.backgroundColor }}
                  title="Cor de fundo"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gerador de QR Code Avançado
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Crie QR Codes profissionais para URL, WiFi, Contatos, PIX e muito mais com frames personalizados e logos
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={loadSample}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Zap className="w-4 h-4" />
              Exemplo
            </button>
            
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            {activeTab === 'generator' && renderGeneratorTab()}
            {activeTab === 'colors' && renderColorsTab()}
            {activeTab === 'frame' && renderFrameTab()}
            {activeTab === 'logo' && renderLogoTab()}
            {activeTab === 'preview' && renderPreviewTab()}
          </div>
        </div>
      </div>

      {/* Hidden canvas for composition */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <QrCode className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">10 Tipos Diferentes</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                URL, WiFi, Contatos, SMS, Email, PIX, Eventos e muito mais
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Frame className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">Frames Avançados</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                10 estilos incluindo gradientes, sombras e texto personalizado
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ImageIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">Logo Profissional</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Upload de logos com fundo personalizado e cantos arredondados
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-orange-900 mb-2">Controle Total</h3>
              <p className="text-xs text-orange-700 leading-relaxed">
                Cores, tamanhos, correção de erro e margem totalmente personalizáveis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;