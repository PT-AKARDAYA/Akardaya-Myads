import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  Share2,
  Copy,
  Check,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  CreditCard,
  Target,
  FileText,
  ShieldCheck,
  Send,
  Download,
  Award,
  Sparkles,
  Layers,
  MessageSquare
} from 'lucide-react';
import { OrderLead, CompanyConfig, BankAccount } from '../types';

interface OrderInvoiceModalProps {
  order: OrderLead | null;
  isOpen: boolean;
  onClose: () => void;
  companyConfig: CompanyConfig;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  companyConfig,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  // Derive target bank account
  const primaryBank: BankAccount = companyConfig.bankAccounts?.find((b) => b.isPrimary && b.isActive !== false) ||
    companyConfig.bankAccounts?.find((b) => b.isActive !== false) || {
      id: 'default',
      bankName: companyConfig.bankName || 'BCA (Bank Central Asia)',
      accountNumber: companyConfig.bankAccountNumber || '0188-3333-7157',
      accountHolder: companyConfig.bankAccountHolder || 'PT Akardaya Telekomunikasi Indonesia',
      isPrimary: true,
      isActive: true,
    };

  const invoiceNumber = `INV-${order.id ? order.id.toUpperCase() : 'ORD-' + Date.now().toString().slice(-6)}`;
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const formattedDate = orderDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate payment numbers
  const totalAmount = order.totalPayment || (
    typeof order.estimatedBudget === 'string'
      ? parseInt(order.estimatedBudget.replace(/\D/g, ''), 10) || 0
      : Number(order.estimatedBudget) || 0
  );

  const isTopUp = order.selectedPackageId === 'topup-custom' ||
    (order.selectedPackageName && order.selectedPackageName.toLowerCase().includes('top-up')) ||
    (order.campaignType && order.campaignType.toUpperCase() === 'TOPUP') ||
    Boolean(order.myAdsEmail);

  const isTargeted = order.campaignType === 'TARGETED';
  const isLba = order.campaignType === 'LBA';

  // Handle Print Action (Save as PDF or Physical Print) with dedicated clean print rendering
  const handlePrint = () => {
    setIsPrinting(true);

    if (typeof window === 'undefined') return;

    try {
      // Find or create a dedicated hidden iframe for printing
      let printFrame = document.getElementById('akardaya-invoice-print-frame') as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'akardaya-invoice-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        printFrame.style.visibility = 'hidden';
        document.body.appendChild(printFrame);
      }

      const invoiceElement = invoicePrintRef.current;
      if (!invoiceElement) {
        window.print();
        setIsPrinting(false);
        return;
      }

      // Clone content and remove dark-mode specific styling for printing
      const contentHtml = invoiceElement.innerHTML;

      const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
      if (!frameDoc) {
        window.print();
        setIsPrinting(false);
        return;
      }

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="utf-8">
            <title>${invoiceNumber} - ${companyConfig.brandName}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                      mono: ['"JetBrains Mono"', 'monospace'],
                    }
                  }
                }
              }
            </script>
            <style>
              @page {
                size: A4 portrait;
                margin: 8mm 10mm 8mm 10mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
                box-sizing: border-box;
              }
              html, body {
                margin: 0;
                padding: 0;
                background-color: #ffffff !important;
                color: #0f172a !important;
                font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                font-size: 11.5px;
                line-height: 1.45;
              }
              .print-container {
                width: 100%;
                max-width: 780px;
                margin: 0 auto;
                background: #ffffff;
                color: #0f172a;
              }
              /* Force light mode styles during print */
              .dark {
                color-scheme: light !important;
              }
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body class="p-2">
            <div class="print-container">
              ${contentHtml}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                }, 250);
              };
            </script>
          </body>
        </html>
      `);
      frameDoc.close();

      setTimeout(() => {
        setIsPrinting(false);
      }, 1000);
    } catch (err) {
      console.warn('Iframe print fallback to window.print:', err);
      window.print();
      setIsPrinting(false);
    }
  };

  // Generate WhatsApp formatted text
  const generateWhatsAppInvoiceText = () => {
    let text = `📄 *OFFICIAL INVOICE PESANAN - ${companyConfig.brandName}*\n`;
    text += `No. Faktur: *${invoiceNumber}*\n`;
    text += `Tanggal: ${formattedDate} (${formattedTime} WIB)\n`;
    text += `Status: *${order.status === 'COMPLETED' ? 'LUNAS / SELESAI' : order.status === 'CONTACTED' ? 'DALAM PROSES' : 'MENUNGGU PEMBAYARAN'}*\n`;
    text += `----------------------------------------\n`;
    text += `👤 *DATA PELANGGAN*\n`;
    text += `• Nama: *${order.customerName}*\n`;
    if (order.businessName) text += `• Usaha/Brand: *${order.businessName}*\n`;
    text += `• No. WhatsApp: *${order.whatsapp}*\n`;
    if (order.myAdsEmail) text += `• Email Akun MyAds: *${order.myAdsEmail}*\n`;

    text += `\n🎯 *RINCIAN LAYANAN KAMPANYE*\n`;
    text += `• Paket Iklan: *${order.selectedPackageName}*\n`;
    text += `• Tipe Kampanye: *${order.campaignType || 'BROADCAST'}*\n`;
    if (order.channelName) text += `• Saluran Media: *${order.channelName}*\n`;
    if (order.targetCityOrArea) text += `• Sasaran Area: *${order.targetCityOrArea}*\n`;
    if (order.estimatedReach) text += `• Estimasi Jangkauan: *~${order.estimatedReach.toLocaleString('id-ID')} Penerima*\n`;
    if (order.broadcastDate) text += `• Jadwal Siar: *${order.broadcastDate}*\n`;
    if (order.senderName) text += `• Masking / Sender: *${order.senderName}*\n`;
    if (order.adMessageContent) text += `• Teks Iklan: "${order.adMessageContent}"\n`;

    text += `\n💰 *TOTAL TAGIHAN / PEMBAYARAN*\n`;
    text += `• *Rp ${totalAmount.toLocaleString('id-ID')}*\n`;
    text += `----------------------------------------\n`;
    text += `💳 *REKENING PEMBAYARAN RESMI*\n`;
    text += `• Bank: *${primaryBank.bankName}*\n`;
    text += `• No. Rekening: *${primaryBank.accountNumber}*\n`;
    text += `• Atas Nama: *${primaryBank.accountHolder}*\n\n`;
    text += `Silakan lakukan pembayaran dan lampirkan bukti transfer di chat ini untuk proses aktivasi kampanye. Terima kasih!\n\n`;
    text += `_${companyConfig.officeAddress}_`;

    return text;
  };

  // Handle Send to WhatsApp
  const handleSendToWhatsApp = () => {
    const waText = generateWhatsAppInvoiceText();
    const cleanWa = (order.whatsapp || '').replace(/\D/g, '');
    const targetWa = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;
    const url = `https://wa.me/${targetWa || companyConfig.waNumber}?text=${encodeURIComponent(waText)}`;
    window.open(url, '_blank');
  };

  // Copy Full Invoice Summary
  const handleCopyInvoice = () => {
    const text = generateWhatsAppInvoiceText();
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      {/* Print Specific CSS to isolate the invoice container when printing via browser Ctrl+P */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 8mm 10mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body > *:not(.akardaya-invoice-modal-root) {
            display: none !important;
          }
          .akardaya-invoice-modal-root {
            position: static !important;
            inset: auto !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            overflow: visible !important;
            height: auto !important;
            width: 100% !important;
            z-index: auto !important;
          }
          .akardaya-invoice-modal-dialog {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .akardaya-invoice-scroll-area {
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
          #invoice-printable-area {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="akardaya-invoice-modal-root fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="akardaya-invoice-modal-dialog relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden">
          {/* Header Action Bar (No Print) */}
          <div className="no-print px-4 py-3 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm border-b border-slate-800 z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-xs sm:text-sm leading-tight flex items-center gap-2 truncate">
                  <span>Faktur & Invoice Pesanan</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {invoiceNumber}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  Cetak langsung, simpan format PDF, atau kirim rincian ke WhatsApp pelanggan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Cetak Faktur atau Simpan sebagai PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak / PDF</span>
              </button>

              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Kirim ke WhatsApp Pelanggan"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim ke WA</span>
              </button>

              <button
                type="button"
                onClick={handleCopyInvoice}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 cursor-pointer"
                title="Salin Teks Invoice"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{isCopied ? 'Tersalin' : 'Salin'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors ml-1 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Printable Invoice Content */}
          <div className="akardaya-invoice-scroll-area flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950">
            <div
              id="invoice-printable-area"
              ref={invoicePrintRef}
              className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 space-y-6"
            >
              {/* 1. Official Header & Letterhead */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center font-black text-base shadow-sm">
                      M
                    </div>
                    <div>
                      <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        {companyConfig.brandName}
                      </h1>
                      <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block">
                        Official Partner of Telkomsel MyAds Indonesia
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm pt-1 leading-relaxed">
                    {companyConfig.officeAddress}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{companyConfig.waDisplayNumber || companyConfig.waNumber}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-blue-600" />
                      <span>{companyConfig.supportEmail || 'info@akardaya.co.id'}</span>
                    </span>
                  </div>
                </div>

                {/* Invoice Title & Metadata */}
                <div className="sm:text-right space-y-1 shrink-0 bg-slate-50 dark:bg-slate-850 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                  <div className="inline-block px-3 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-xs">
                    FAKTUR PESANAN IKLAN
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white pt-1">
                    {invoiceNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tanggal: <span className="font-semibold text-slate-800 dark:text-slate-200">{formattedDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pukul: <span className="font-semibold text-slate-800 dark:text-slate-200">{formattedTime} WIB</span>
                  </div>
                  <div className="pt-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : order.status === 'CONTACTED'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      }`}
                    >
                      {order.status === 'COMPLETED'
                        ? '✓ Lunas / Selesai'
                        : order.status === 'CONTACTED'
                        ? '⏳ Dikonfirmasi / Diproses'
                        : '• Menunggu Pembayaran'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Bill To (Pelanggan) & Order Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Customer Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider text-slate-400">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ditujukan Kepada (Klien):</span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {order.customerName}
                    </div>
                    {order.businessName && (
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        Brand / Usaha: <span className="text-blue-600 dark:text-blue-400">{order.businessName}</span>
                      </div>
                    )}
                    <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp: {order.whatsapp}</span>
                    </div>
                    {order.myAdsEmail && (
                      <div className="text-blue-700 dark:text-blue-400 font-semibold flex items-center gap-1.5 pt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>Email MyAds: {order.myAdsEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Campaign Spec Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider text-slate-400">
                    <Target className="w-3.5 h-3.5 text-rose-600" />
                    <span>Spesifikasi Kampanye:</span>
                  </div>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tipe Kampanye:</span>
                      <span className="font-bold text-slate-900 dark:text-white uppercase">{order.campaignType || 'BROADCAST'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paket Pilihan:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{order.selectedPackageName}</span>
                    </div>
                    {order.broadcastDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Jadwal Siar:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{order.broadcastDate}</span>
                      </div>
                    )}
                    {order.senderName && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sender / Masking:</span>
                        <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{order.senderName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Detailed Targeting & Location (if exists) */}
              {(order.targetCityOrArea || (order.latitude !== undefined && order.longitude !== undefined) || isTargeted || order.adMessageContent) && (
                <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-2 text-xs">
                  <div className="font-bold text-blue-900 dark:text-blue-300 text-[11px] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    <span>Parameter Target & Konten Iklan:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                    {order.targetCityOrArea && (
                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px]">Sasaran Wilayah / Area:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{order.targetCityOrArea}</span>
                      </div>
                    )}

                    {(order.latitude !== undefined && order.longitude !== undefined) && (
                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px]">Titik GPS & Radius LBA:</span>
                        <span className="font-mono text-slate-900 dark:text-white">
                          {order.latitude}, {order.longitude} ({order.radiusMeters ? (order.radiusMeters >= 1000 ? `${(order.radiusMeters / 1000).toFixed(1)} km` : `${order.radiusMeters} m`) : '1 km'})
                        </span>
                        {order.streetAddress && <span className="block text-[11px] text-slate-500 truncate">{order.streetAddress}</span>}
                      </div>
                    )}

                    {order.uploadedListFileName && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-semibold block text-[10px]">Database Kontak yang Diunggah:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {order.uploadedListFileName} ({order.uploadedListFileSize || ''}{order.uploadedListFileCount ? ` • ~${order.uploadedListFileCount} Nomor` : ''})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Demographic Filter Chips (Targeted) */}
                  {(order.targetAgeGroup || order.targetGender || order.targetReligion || order.targetArpuSpending || order.targetSes || order.targetDeviceOs) && (
                    <div className="pt-2 border-t border-blue-200/50 dark:border-blue-900/50">
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">Filter Profiling Audiens:</span>
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        {order.targetAgeGroup && <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">Usia: {order.targetAgeGroup}</span>}
                        {order.targetGender && <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">Gender: {order.targetGender}</span>}
                        {order.targetReligion && <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">Agama: {order.targetReligion}</span>}
                        {order.targetArpuSpending && <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">ARPU: {order.targetArpuSpending}</span>}
                        {order.targetSes && <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">SES: {order.targetSes}</span>}
                        {order.targetDeviceOs && <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">Device: {order.targetDeviceOs}</span>}
                        {order.targetMaritalStatus && <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">Status: {order.targetMaritalStatus}</span>}
                      </div>
                    </div>
                  )}

                  {/* Ad Message Content */}
                  {order.adMessageContent && (
                    <div className="pt-2 border-t border-blue-200/50 dark:border-blue-900/50">
                      <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Teks Pesan Iklan (Siar):</span>
                      <p className="italic text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                        "{order.adMessageContent}"
                      </p>
                      {order.webLink && (
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 block pt-1">
                          Link Promosi: <a href={order.webLink} target="_blank" rel="noreferrer" className="underline">{order.webLink}</a>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Itemized Costing & Calculation Table */}
              <div className="space-y-2">
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-2.5 sm:p-3 w-10 text-center">No</th>
                        <th className="p-2.5 sm:p-3">Rincian Layanan / Media</th>
                        <th className="p-2.5 sm:p-3 text-center">Estimasi Volume</th>
                        <th className="p-2.5 sm:p-3 text-right">Jumlah (IDR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="p-2.5 sm:p-3 text-center text-slate-400">1</td>
                        <td className="p-2.5 sm:p-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {order.selectedPackageName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {order.channelName || (isTopUp ? 'Pengisian Saldo Akun MyAds Resmi' : 'Multi-Channel Promosi Telkomsel')}
                          </div>
                        </td>
                        <td className="p-2.5 sm:p-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {order.estimatedReach
                            ? `~${order.estimatedReach.toLocaleString('id-ID')} Kontak`
                            : isTopUp
                            ? 'Bebas Alokasi'
                            : '1 Paket'}
                        </td>
                        <td className="p-2.5 sm:p-3 text-right font-bold text-slate-900 dark:text-white">
                          Rp {totalAmount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Subtotals and Grand Total */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
                  <div className="text-xs text-slate-500 space-y-1">
                    <p className="italic">
                      * Harga sudah termasuk alokasi saldo siar resmi, setup masking, dan dashboard analytics Telkomsel MyAds.
                    </p>
                    {order.notes && (
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        Catatan Klien: <span className="italic">"{order.notes}"</span>
                      </p>
                    )}
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal Tagihan:</span>
                      <span className="font-semibold">Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Biaya Setup / Admin:</span>
                      <span className="font-semibold">GRATIS (Rp 0)</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-700 text-sm font-black text-blue-600 dark:text-blue-400">
                      <span>Total Pembayaran:</span>
                      <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Official Payment Transfer & Bank Information */}
              <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Rekening Tujuan Pembayaran Resmi:</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      Bank: <span className="text-emerald-700 dark:text-emerald-400">{primaryBank.bankName}</span>
                    </div>
                    <div className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400 tracking-wider">
                      {primaryBank.accountNumber}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-semibold">
                      Atas Nama: {primaryBank.accountHolder}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 sm:max-w-xs sm:text-right">
                    {companyConfig.paymentInstructions || 'Transfer sesuai nominal di atas, lalu lampirkan bukti transfer ke WhatsApp admin untuk verifikasi.'}
                  </div>
                </div>
              </div>

              {/* Bukti Transfer Terlampir jika ada */}
              {order.paymentProofUrl && (
                <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Lampiran Bukti Transfer Pembayaran Terverifikasi</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                      {order.paymentProofUploadedAt || 'Telah Diunggah'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={order.paymentProofUrl}
                      alt="Bukti Transfer"
                      className="w-16 h-16 object-cover rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-2xs"
                    />
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {order.paymentProofFileName || 'Struk_Transfer_Pembayaran.jpg'}
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Pembayaran telah divalidasi oleh sistem
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Signature & Digital Stamp Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Faktur Resmi Sah Diterbitkan Otomatis</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Dokumen ini merupakan konfirmasi resmi pemesanan layanan iklan Telkomsel MyAds via PT Akardaya Telekomunikasi Indonesia.
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <div className="text-[10px] text-slate-400">Gresik / Surabaya, {formattedDate}</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-1">
                    PT AKARDAYA TELEKOMUNIKASI INDONESIA
                  </div>
                  <div className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    VERIFIED SYSTEM DIGITAL
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="no-print p-3 sm:px-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Gunakan dialog cetak browser (Ctrl+P / Cmd+P) untuk menyimpan sebagai PDF berkualitas tinggi.</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
