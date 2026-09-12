import React, { useState } from 'react';
import { OrderLead } from '../types';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  Upload,
  Check,
  CreditCard,
  Phone,
  ShieldCheck,
  Calendar,
  User,
  Package,
  FileImage,
  ExternalLink,
} from 'lucide-react';

interface PaymentProofModalProps {
  order: OrderLead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePaymentProof?: (orderId: string, proofUrl: string | undefined, fileName?: string) => void;
}

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdatePaymentProof,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const proofUrl = order.paymentProofUrl;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleDownload = () => {
    if (!proofUrl) return;
    const link = document.createElement('a');
    link.href = proofUrl;
    link.download = `Bukti-Transfer-${order.id}-${order.customerName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (!proofUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Bukti Transfer - ${order.id} - ${order.customerName}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; margin: 0; }
            .header { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; text-align: left; }
            img { max-width: 90%; max-height: 80vh; object-fit: contain; border: 1px solid #ddd; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Bukti Transfer Pembayaran - Telkomsel MyAds</h2>
            <p><strong>No. Order:</strong> ${order.id} | <strong>Nama Klien:</strong> ${order.customerName} | <strong>WhatsApp:</strong> ${order.whatsapp}</p>
            <p><strong>Paket:</strong> ${order.selectedPackageName} | <strong>Total:</strong> ${order.totalPayment ? 'Rp ' + order.totalPayment.toLocaleString('id-ID') : order.estimatedBudget}</p>
            <p><strong>Waktu Upload:</strong> ${order.paymentProofUploadedAt || new Date().toLocaleString('id-ID')}</p>
          </div>
          <img src="${proofUrl}" />
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const compressAndReadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 1400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(img.src);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Gagal memproses gambar'));
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedUrl = await compressAndReadImage(file);
      if (onUpdatePaymentProof) {
        onUpdatePaymentProof(order.id, compressedUrl, file.name);
      }
      setIsUploading(false);
    } catch (err) {
      console.error('Error uploading payment receipt:', err);
      setIsUploading(false);
    }
  };

  const handleDeleteProof = () => {
    if (window.confirm(`Hapus bukti transfer untuk pesanan ${order.id}?`)) {
      if (onUpdatePaymentProof) {
        onUpdatePaymentProof(order.id, undefined);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-sm leading-tight flex items-center gap-2 truncate">
                <span>Bukti Transfer Pembayaran</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {order.id}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {order.customerName} {order.businessName ? `(${order.businessName})` : ''} • {order.selectedPackageName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {proofUrl && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Unduh Gambar Bukti Transfer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Cetak Bukti Transfer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cetak</span>
                </button>
              </>
            )}

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

        {/* Info Strip */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate font-semibold">{order.customerName}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <a
              href={`https://wa.me/${order.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
            >
              {order.whatsapp}
            </a>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate font-bold text-slate-900 dark:text-white">
              {order.totalPayment
                ? `Rp ${Number(order.totalPayment).toLocaleString('id-ID')}`
                : order.estimatedBudget}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] justify-end">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {order.paymentProofUploadedAt || new Date(order.createdAt).toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-900/95 flex flex-col items-center justify-center min-h-[350px] relative">
          {proofUrl ? (
            <div className="relative flex items-center justify-center w-full h-full max-h-[62vh] overflow-hidden select-none">
              <img
                src={proofUrl}
                alt={`Bukti Transfer ${order.id}`}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200 border border-slate-700/60"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                }}
              />
            </div>
          ) : (
            <div className="text-center p-8 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700 shadow-inner">
                <FileImage className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Belum Ada Bukti Transfer</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pelanggan belum melampirkan screenshot bukti transfer pembayaran. Anda dapat mengunggahnya secara manual di bawah ini (misalnya foto struk dari WhatsApp).
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 cursor-pointer transition-all active:scale-95">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Memproses...' : 'Upload Bukti Transfer Sekarang'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Floating / Bottom Control Toolbar */}
        <div className="px-4 sm:px-6 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {proofUrl ? (
            <>
              {/* Zoom & Rotate Controls */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono px-2 text-slate-600 dark:text-slate-300 font-bold">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title="Putar 90 Derajat"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                {(zoomLevel !== 1 || rotation !== 0) && (
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Upload New / Delete / Contact Actions */}
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isUploading ? 'Memproses...' : 'Ganti Bukti'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleDeleteProof}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors"
                  title="Hapus Bukti Transfer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>

                <a
                  href={`https://wa.me/${order.whatsapp}?text=${encodeURIComponent(
                    `Halo Kak ${order.customerName}, kami dari PT Akardaya (Telkomsel MyAds). Bukti transfer untuk pesanan ${order.id} (${order.selectedPackageName}) telah kami terima dan diverifikasi. Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Konfirmasi ke WA</span>
                </a>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-end w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
