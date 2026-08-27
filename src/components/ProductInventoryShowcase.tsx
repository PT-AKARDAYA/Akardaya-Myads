import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { trackRealVisitor } from '../utils/analyticsTracker';
import {
  MapPin,
  Target,
  Radio,
  Sparkles,
  Users,
  Smartphone,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Heart,
  Briefcase,
  Sliders,
  DollarSign,
  Compass,
  Layers,
  ChevronRight,
  Eye,
  Info,
  Maximize2,
} from 'lucide-react';

interface ChannelProduct {
  id: string;
  name: string;
  category: string;
  objectives: ('LBA' | 'Targeted' | 'Broadcast')[];
  formatType: 'Text Based' | 'Text and Visual' | 'Visual Based' | 'Interaktif';
  audiensReach: string;
  description: string;
  previewHeader: string;
  previewContent: React.ReactNode;
  highlights: string[];
}

export const ProductInventoryShowcase: React.FC = () => {
  const { data } = useApp();
  const [activeInventoryTab, setActiveInventoryTab] = useState<'all' | 'LBA' | 'Targeted' | 'Broadcast'>('all');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const handleTabChange = (tab: 'all' | 'LBA' | 'Targeted' | 'Broadcast') => {
    setActiveInventoryTab(tab);
    const targetPage = tab === 'all' ? '/inventori-myads' : `/inventori-myads/${tab.toLowerCase()}`;
    trackRealVisitor(targetPage, 'pageview', data?.companyConfig?.spreadsheetUrl);
  };

  const handleSelectChannel = (channelId: string | null) => {
    setSelectedChannelId(channelId);
    if (channelId) {
      trackRealVisitor(`/inventori-myads/preview-${channelId}`, 'pageview', data?.companyConfig?.spreadsheetUrl);
    }
  };

  // Channels Database matching Attachment 2
  const channelProducts: ChannelProduct[] = [
    {
      id: 'sms',
      name: 'SMS',
      category: 'Saluran Klasik Telco',
      objectives: ['LBA', 'Targeted', 'Broadcast'],
      formatType: 'Text Based',
      audiensReach: '150+ Juta',
      description: 'Pesan teks langsung masuk ke inbox SMS nomor pelanggan tanpa perlu koneksi internet data.',
      previewHeader: 'BINTANG LEO',
      highlights: ['Tingkat keterbukaan 98%', 'Tanpa butuh kuota internet', 'Dukungan Sender ID Resmi'],
      previewContent: (
        <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 text-xs space-y-2 border border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
            <p className="font-bold text-blue-600 dark:text-blue-400 mb-1">PROMO SPESIAL!</p>
            <p className="text-[11px] leading-relaxed">
              Batik Tulis Bintang Leo DISKON 50% + gratis ongkir se-Indonesia. Stok terbatas, berlaku s/d 30 Apr.
            </p>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-blue-500 font-semibold underline">
              myads.id/bintangleo
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'mms',
      name: 'MMS',
      category: 'Pesan Multimedia',
      objectives: ['LBA', 'Targeted', 'Broadcast'],
      formatType: 'Text and Visual',
      audiensReach: '150+ Juta',
      description: 'Pesan visual berisi gambar katalog produk berkualitas tinggi disertai teks promosi komprehensif.',
      previewHeader: 'BINTANG LEO',
      highlights: ['Visual Banner HD', 'Langsung tampil di galeri pesan', 'Konversi visual lebih tinggi'],
      previewContent: (
        <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 text-xs space-y-2 border border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="h-28 rounded-lg bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-600 flex flex-col justify-end p-2.5 text-white relative overflow-hidden">
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs text-[9px] font-bold">
                Rp 1.600.000
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-200 tracking-wider">Koleksi Mewah</span>
              <p className="text-xs font-black leading-tight">Batik Tulis Sutra ATBM</p>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Hadirkan keanggunan sejati dalam setiap helai busana formal & eksekutif. Pesan sekarang dapatkan cashback 10%.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'pop_up_ussd',
      name: 'Pop Up USSD',
      category: 'Layar Kunci Telco',
      objectives: ['LBA', 'Targeted', 'Broadcast'],
      formatType: 'Text Based',
      audiensReach: '150+ Juta',
      description: 'Pesan instan yang langsung muncul di layar depan ponsel (pop-up dialog) tanpa harus membuka inbox pesan.',
      previewHeader: '12:00 · Notifikasi Layar',
      highlights: ['Pop-up langsung di layar utama', 'Zero-click opening rate', 'Cocok untuk flash sale urgent'],
      previewContent: (
        <div className="bg-slate-900 rounded-2xl p-4 text-xs text-white border border-slate-800 space-y-3">
          <div className="text-center font-mono text-slate-400 text-[10px]">19/01/2026</div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center space-y-2">
            <p className="font-bold text-amber-400 text-xs">⚡ FLASH SALE 1 JAM!</p>
            <p className="text-[11px] text-slate-200 leading-tight">
              Batik Tulis Bintang Leo diskon 50% + gratis ongkir. Berakhir dalam 60 menit!
            </p>
            <div className="flex gap-2 pt-2 text-[11px] font-semibold">
              <button className="flex-1 py-1 rounded bg-white/20 text-slate-300">Cancel</button>
              <button className="flex-1 py-1 rounded bg-blue-600 text-white">Save</button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'google_message_rcs',
      name: 'Google Message (RCS)',
      category: 'Rich Communication Services',
      objectives: ['LBA', 'Targeted', 'Broadcast'],
      formatType: 'Text and Visual',
      audiensReach: '90+ Juta',
      description: 'Format generasi baru Android dengan kartu interaktif kaya media (Rich Cards, Tombol CTA Cepat, Logo Terverifikasi).',
      previewHeader: 'BINTANG LEO · Official RCS',
      highlights: ['Tombol CTA Sekali Klik', 'Katalog Carousel Bergambar', 'Profil Bisnis Terverifikasi'],
      previewContent: (
        <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 text-xs space-y-2 border border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-700 to-indigo-800 p-3 text-white flex flex-col justify-end">
              <span className="text-[10px] font-bold text-blue-200">Beli Sekarang, Diskon 50%!</span>
              <p className="text-xs font-extrabold leading-tight">Batik Katun & Sutra Premium</p>
            </div>
            <div className="p-2.5 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800 text-center font-medium">
                  Batik Tulis Katun
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800 text-center font-medium">
                  Batik Tulis Sutra
                </div>
              </div>
              <button className="w-full py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center gap-1">
                <span>🛍️ Lihat Katalog Produk</span>
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'waba',
      name: 'WABA (WhatsApp Business)',
      category: 'WhatsApp Official API',
      objectives: ['LBA', 'Targeted', 'Broadcast'],
      formatType: 'Text and Visual',
      audiensReach: '90+ Juta',
      description: 'Pesan resmi WhatsApp Business dengan centang hijau (Green Tick), nama bisnis resmi, dan media interaktif.',
      previewHeader: 'Bintang Leo Business Account ✓',
      highlights: ['Centang Hijau Resmi (Green Tick)', 'Tingkat konversi nomor 1 di Indonesia', 'Dukungan Media Banner & Link'],
      previewContent: (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-3 text-xs space-y-2 border border-emerald-200 dark:border-emerald-800/40">
          <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="h-20 rounded-lg bg-gradient-to-r from-emerald-800 to-teal-900 p-2 text-white flex flex-col justify-end">
              <span className="text-[10px] font-bold text-emerald-300">PROMO AKHIR BULAN</span>
              <span className="text-xs font-black">Koleksi Batik Tulis Premium</span>
            </div>
            <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed">
              Halo! Ada kabar gembira nih, PROMO AKHIR BULAN diskon 50% + free gift untuk pembelian di atas 500rb.
            </p>
            <div className="pt-1 space-y-1">
              <div className="py-1 px-2 rounded bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                🔗 Lihat Katalog Lengkap
              </div>
              <div className="py-1 px-2 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-center font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                💬 Belanja Sekarang via CS
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'sms_flash',
      name: 'SMS Flash (Pop Up)',
      category: 'Pesan Kilat Prioritas',
      objectives: ['LBA', 'Targeted', 'Broadcast'],
      formatType: 'Text Based',
      audiensReach: '90+ Juta',
      description: 'Pesan SMS darurat/prioritas tinggi yang langsung membuka jendela pop-up di layar pengguna.',
      previewHeader: '12:00 · SMS Flash Dialog',
      highlights: ['Tampil langsung di latar depan', 'Tidak tertimbun tumpukan pesan', 'Responsif untuk promo berbatas waktu'],
      previewContent: (
        <div className="bg-slate-900 rounded-2xl p-4 text-xs text-white border border-slate-800 space-y-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 space-y-2">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">⚡ FLASH SALE 1 JAM!</span>
            <p className="text-[11px] text-slate-200 leading-tight">
              Batik Tulis Bintang Leo diskon 50% + gratis ongkir. Berakhir dalam 60 menit! Stok terbatas!
            </p>
            <p className="text-[10px] text-blue-400 underline font-semibold">
              Klik: myads.id/bintangleo
            </p>
            <div className="flex gap-2 pt-2 text-[11px] font-semibold">
              <button className="flex-1 py-1 rounded bg-white/20 text-slate-300">Cancel</button>
              <button className="flex-1 py-1 rounded bg-rose-600 text-white">Save</button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'display_banner',
      name: 'Display Banner',
      category: 'Iklan Web & Portal Media',
      objectives: ['Targeted'],
      formatType: 'Visual Based',
      audiensReach: '150+ Juta',
      description: 'Iklan banner visual yang dipesan untuk tampil di jaringan portal web media nasional, aplikasi browser, dan publisher rekanan.',
      previewHeader: 'Media & Portal News Network',
      highlights: ['Tampil di media nasional terkemuka', 'Dukungan visual banner grafis', 'Menjangkau audiens browsing aktif'],
      previewContent: (
        <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 text-xs space-y-2 border border-slate-200 dark:border-slate-800">
          <div className="space-y-1 text-slate-500 text-[9px]">
            <p className="font-serif italic">"Senang sekali, karena selama ini saya tidak pernah merasakan kembali menonton pertandingan sepakbola..."</p>
          </div>
          <div className="bg-gradient-to-r from-red-900 via-red-800 to-amber-900 rounded-xl p-3 text-white shadow-xs border border-red-700">
            <span className="text-[8px] uppercase tracking-wider font-bold bg-white/20 px-1 py-0.5 rounded">ADS · SPONSORED</span>
            <h5 className="font-black text-xs mt-1">Batik Tulis Berkualitas dengan Motif Berkelas</h5>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] text-amber-200 font-bold">Diskon s/d 50% + Free Ongkir</span>
              <button className="px-2 py-0.5 rounded bg-white text-red-900 font-bold text-[9px]">Beli Sekarang</button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'waba_interaktif',
      name: 'WABA Interaktif',
      category: 'WhatsApp Official API',
      objectives: ['LBA', 'Targeted', 'Broadcast'],
      formatType: 'Interaktif',
      audiensReach: '90+ Juta',
      description: 'WhatsApp resmi dengan tombol aksi interaktif (Call-to-Action, Quick Replies, dan Menu Pilihan Produk).',
      previewHeader: 'Bintang Leo Business Account ✓',
      highlights: ['Tombol Quick Reply 1-Tap', 'Menu List interaktif tanpa ketik', 'Integrasi otomatis ke admin'],
      previewContent: (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-3 text-xs space-y-2 border border-emerald-200 dark:border-emerald-800/40">
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">PRODUK TERBARU BATIK LEO!</p>
            <p className="text-[10px] text-slate-600 dark:text-slate-300">
              Halo! Selamat datang di Batik Tulis Bintang Leo Official. Yuk intip produk unggulan kami:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-900 text-center">
                <div className="h-10 bg-amber-800/80 rounded mb-1"></div>
                <span className="text-[9px] font-bold block">Batik Tulis Sutra</span>
                <button className="mt-1 w-full py-0.5 rounded bg-emerald-600 text-white text-[8px] font-bold">Beli Sekarang</button>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-900 text-center">
                <div className="h-10 bg-indigo-800/80 rounded mb-1"></div>
                <span className="text-[9px] font-bold block">Batik Tulis Katun</span>
                <button className="mt-1 w-full py-0.5 rounded bg-blue-600 text-white text-[8px] font-bold">Lihat Detail</button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'pop_up_interaktif',
      name: 'Pop Up Interaktif (USSD Menu)',
      category: 'Interaksi Telco',
      objectives: ['Targeted'],
      formatType: 'Interaktif',
      audiensReach: '150+ Juta',
      description: 'Layar dialog interaktif bernomor di mana penerima dapat membalas pilihan angka (1, 2, 3) secara instan.',
      previewHeader: '12:00 · Pop Up Interaktif',
      highlights: ['Tanggapan langsung angka 1/2/3', 'Tingkat partisipasi instan', 'Tanpa pulsa pelanggan'],
      previewContent: (
        <div className="bg-slate-900 rounded-2xl p-4 text-xs text-white border border-slate-800 space-y-2">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 space-y-2">
            <p className="text-[11px] font-semibold text-slate-200">
              Selamat! Anda terpilih sebagai Top Spender Batik Bintang Leo bulan ini! Klaim hadiah eksklusif dengan memilih menu:
            </p>
            <div className="text-[10px] space-y-1 text-amber-300 font-mono">
              <p>1. Klaim Hadiah Utama</p>
              <p>2. Syarat & Ketentuan</p>
              <p>3. Kontak Admin Bintang Leo</p>
            </div>
            <div className="h-6 rounded bg-white/20 border border-white/30 flex items-center px-2 text-[10px] text-slate-400">
              Ketik angka pilihan di sini...
            </div>
            <div className="flex gap-2 pt-1 text-[11px] font-semibold">
              <button className="flex-1 py-1 rounded bg-white/20 text-slate-300">Cancel</button>
              <button className="flex-1 py-1 rounded bg-blue-600 text-white">Answer</button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'sms_interaktif',
      name: 'SMS Interaktif (2-Way SMS)',
      category: 'Percakapan SMS 2 Arah',
      objectives: ['Targeted'],
      formatType: 'Interaktif',
      audiensReach: '150+ Juta',
      description: 'Layanan SMS dua arah berbasis short code (misal 8000), pelanggan dapat membalas SMS dengan kata kunci promo.',
      previewHeader: '8000 · SMS Interaktif',
      highlights: ['Interaksi 2 arah (Two-Way)', 'Short Code 4 digit resmi', 'Validasi kupon & voucher instan'],
      previewContent: (
        <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 text-xs space-y-2 border border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[9px] font-mono text-slate-400">BINTANGLEO#0812345678</span>
            <p className="text-[10px] text-slate-700 dark:text-slate-300">
              Selamat! Kode promo Anda: <strong className="text-blue-600 font-mono">LEO20</strong>. Tunjukkan SMS ini ke kasir outlet Batik Bintang Leo terdekat.
            </p>
            <div className="text-[9px] text-slate-400">
              Berlaku s/d 30 Apr 2026. Info: myads.id/bintangleo
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl rounded-tr-xs text-[10px] font-bold">
              KLAIM LEO20
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'kode_interaktif',
      name: 'Kode Interaktif (*...#)',
      category: 'Dial Code Menu',
      objectives: ['Targeted'],
      formatType: 'Interaktif',
      audiensReach: '150+ Juta',
      description: 'Format menu interaktif yang diakses melalui kombinasi kode dial telepon (USSD) berkecepatan tinggi.',
      previewHeader: '12:00 · Pengumuman Top Spender',
      highlights: ['Menu berbasis dial telco', 'Bekerja di semua tipe HP (Feature phone & Smartphone)', 'Akses super cepat'],
      previewContent: (
        <div className="bg-slate-900 rounded-2xl p-4 text-xs text-white border border-slate-800 space-y-2">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400">PENGUMUMAN TOP SPENDER</span>
            <p className="text-[10px] text-slate-200">
              Selamat! Anda terpilih sebagai Top Spender Batik Tulis Bintang Leo! Klaim hadiah eksklusif Anda sekarang dengan pilih menu:
            </p>
            <div className="text-[10px] space-y-0.5 text-amber-300 font-mono">
              <p>1. Klaim Hadiah</p>
              <p>2. Syarat & Ketentuan</p>
              <p>3. Kontak Admin Bintang Leo</p>
            </div>
            <div className="flex gap-2 pt-1 text-[11px] font-semibold">
              <button className="flex-1 py-1 rounded bg-white/20 text-slate-300">Cancel</button>
              <button className="flex-1 py-1 rounded bg-blue-600 text-white">Answer</button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'wa_flow',
      name: 'WA Flow (Formulir Chat)',
      category: 'WhatsApp Official Form',
      objectives: ['LBA', 'Targeted', 'Broadcast'],
      formatType: 'Interaktif',
      audiensReach: '90+ Juta',
      description: 'Formulir pendaftaran, survei, dan pemesanan interaktif native yang langsung diisi di dalam chat WhatsApp.',
      previewHeader: 'Bintang Leo Business Account ✓',
      highlights: ['Formulir langsung di dalam WhatsApp', 'Pengisian formulir tanpa keluar aplikasi', 'Lead data tersimpan instan'],
      previewContent: (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-3 text-xs space-y-2 border border-emerald-200 dark:border-emerald-800/40">
          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="h-16 rounded-lg bg-gradient-to-r from-emerald-700 to-teal-800 flex items-center justify-center p-2 text-white text-center">
              <span className="text-[10px] font-bold">Formulir Pendaftaran Kemitraan Reseller Batik Bintang Leo</span>
            </div>
            <div className="space-y-1.5 text-[9px]">
              <div>
                <label className="text-slate-400 font-medium">Nama Lengkap</label>
                <div className="h-5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 flex items-center">Budi Santoso</div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">Nomor WhatsApp</label>
                <div className="h-5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 flex items-center">081234567890</div>
              </div>
            </div>
            <button className="w-full py-1 rounded bg-emerald-600 text-white font-bold text-[9px] shadow-xs">
              Kirim Formulir Reseller
            </button>
          </div>
        </div>
      ),
    },
  ];

  // Filtering products
  const filteredProducts = channelProducts.filter((product) => {
    if (activeInventoryTab === 'all') return true;
    return product.objectives.includes(activeInventoryTab);
  });

  const selectedProduct = channelProducts.find((p) => p.id === selectedChannelId);

  return (
    <section id="section-inventory-products" className="py-14 sm:py-20 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* ========================================================= */}
        {/* BAGIAN 1: TIGA PILAR INVENTORI UTAMA MYADS (Lampiran 1) */}
        {/* ========================================================= */}
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inventori & Spesifikasi Penargetan Resmi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              3 Jenis Inventori Utama MyAds
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              MyAds menawarkan tiga jenis inventory utama, memungkinkan bisnis memilih tingkat presisi targeting yang sesuai dengan anggaran dan tujuan promosinya.
            </p>
          </div>

          {/* 3 Pillars Cards Grid (Matching Lampiran 1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-2">
            
            {/* 1. LBA Card */}
            <div className="bg-white dark:bg-slate-850 rounded-3xl border-2 border-red-500/80 shadow-md shadow-red-500/5 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
              {/* Header Badge */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 p-5 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-red-100">Pilar 01</span>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                    LOCATION BASED ADVERTISING (LBA)
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                {/* Objektif */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                    OBJEKTIF
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    Menjangkau calon pelanggan di sekitar lokasi bisnis, dengan akurasi <em>targeting</em> hingga radius <strong>3 km</strong>.
                  </p>
                </div>

                {/* Kapabilitas */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                    KAPABILITAS
                  </span>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800/60">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Pin Point</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          Menargetkan titik lokasi spesifik yang tepat (koordinat gedung, outlet, jalan).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800/60">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Radius Area</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          Menargetkan audiens dalam radius tertentu dari suatu titik (misal 500m - 3km).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800/60">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Location Type</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          Menargetkan audiens berdasarkan kategori tempat (indoor mal/perkantoran atau outdoor).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-semibold text-[11px] border border-red-200 dark:border-red-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                    Ideal untuk: Toko Retail, F&B, Grand Opening, Acara Lokal
                  </span>
                </div>
              </div>
            </div>

            {/* 2. TARGETED Card */}
            <div className="bg-white dark:bg-slate-850 rounded-3xl border-2 border-red-500/80 shadow-md shadow-red-500/5 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
              {/* Header Badge */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 p-5 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-red-100">Pilar 02</span>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                    TARGETED
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                {/* Objektif */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                    OBJEKTIF
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    Menjangkau pelanggan yang tepat berdasarkan minat dan perilaku yang relevan, ideal untuk penawaran produk spesifik.
                  </p>
                </div>

                {/* Kapabilitas (8 Demographics/Criteria) */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                    KAPABILITAS TARGETING
                  </span>

                  <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <Users className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-tight">Grup Usia</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Rentang umur</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-tight">Agama</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Segmentasi religi</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <Sliders className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-tight">Jenis Kelamin</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Pria / Wanita</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <DollarSign className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-tight">ARPU Spending</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Pengeluaran pulsa</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <Briefcase className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-tight">Status SES</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Sosial ekonomi</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <Smartphone className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-tight">Device & OS</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Android / iOS / Tipe</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <Heart className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-tight">Pernikahan</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Lajang / Menikah</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-tight">Minat / Perilaku</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Hobi & Gaya hidup</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-semibold text-[11px] border border-red-200 dark:border-red-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                    Ideal untuk: Produk Niche, Fashion, Edukasi, Finansial
                  </span>
                </div>
              </div>
            </div>

            {/* 3. BROADCAST Card */}
            <div className="bg-white dark:bg-slate-850 rounded-3xl border-2 border-red-500/80 shadow-md shadow-red-500/5 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
              {/* Header Badge */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 p-5 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-red-100">Pilar 03</span>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                    BROADCAST
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                  <Radio className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                {/* Objektif */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                    OBJEKTIF
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    Menjangkau seluruh basis pelanggan bisnis dengan cepat dengan memanfaatkan <strong>database pelanggan mandiri</strong>.
                  </p>
                </div>

                {/* Kapabilitas */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                    KAPABILITAS PENYIARAN
                  </span>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800/60">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Template Standar</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          Dikirim serentak ke audiens umum berdasarkan file Excel / CSV berisi nomor penerima yang diunggah.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800/60">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Template Personal</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          Dikirim ke nomor spesifik dengan personalisasi dinamis variabel seperti [Nama], [Alamat], [Tagihan/Poin], dan lainnya.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-semibold text-[11px] border border-red-200 dark:border-red-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                    Ideal untuk: CRM Pelanggan Lama, Reminder Tagihan, Promo Member
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>


        {/* ========================================================= */}
        {/* BAGIAN 2: 12 FORMAT SALURAN IKLAN & MOCKUP HP (Lampiran 2) */}
        {/* ========================================================= */}
        <div id="section-channel-catalog" className="space-y-6 pt-6">
          {/* Header Catalog */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>Katalog Saluran & Tampilan Layar HP Realistis</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                12 Format Saluran Periklanan MyAds
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Jelajahi visualisasi asli tampilan iklan di layar ponsel calon pelanggan, lengkap dengan spesifikasi objektif penargetan dan jangkauan audiens telco.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start md:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  activeInventoryTab === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Semua (12)
              </button>
              <button
                onClick={() => handleTabChange('LBA')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  activeInventoryTab === 'LBA'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>LBA</span>
              </button>
              <button
                onClick={() => handleTabChange('Targeted')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  activeInventoryTab === 'Targeted'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Targeted</span>
              </button>
              <button
                onClick={() => handleTabChange('Broadcast')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  activeInventoryTab === 'Broadcast'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast</span>
              </button>
            </div>
          </div>

          {/* Legenda Bar (Matching Lampiran 2) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              LEGENDA OBJEKTIF:
            </span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 font-semibold">
              <div className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <MapPin className="w-4 h-4" />
                <span>LBA (Location Based)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <Target className="w-4 h-4" />
                <span>Targeted (Demografi/Minat)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <Radio className="w-4 h-4" />
                <span>Broadcast (Database Mandiri)</span>
              </div>
            </div>
          </div>

          {/* 12 Channels Grid with Realistic Phone Frames */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((channel) => (
              <div
                key={channel.id}
                id={`channel-card-${channel.id}`}
                className="bg-white dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-blue-400 dark:hover:border-blue-500"
              >
                {/* Channel Header */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      {channel.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {channel.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {channel.formatType}
                  </span>
                </div>

                {/* Realistic Phone Screen Mockup Container */}
                <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 flex-1 flex flex-col justify-center">
                  <div className="w-full max-w-[260px] mx-auto bg-black rounded-[28px] p-2.5 shadow-md border-2 border-slate-700 relative">
                    {/* Top Speaker Notch & Camera Dot */}
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700"></div>
                      <div className="w-10 h-1 rounded-full bg-slate-800"></div>
                    </div>

                    {/* Phone Screen Canvas */}
                    <div className="min-h-[190px] rounded-[18px] overflow-hidden flex flex-col justify-center">
                      {channel.previewContent}
                    </div>

                    {/* Bottom Navigation Indicator Bar */}
                    <div className="w-16 h-1 rounded-full bg-slate-600 mx-auto mt-2.5"></div>
                  </div>
                </div>

                {/* Channel Metadata & Badges (Matching Attachment Specs) */}
                <div className="p-4 space-y-3 bg-white dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {/* Objective Indicators */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Objektif:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {channel.objectives.map((obj) => (
                        <span
                          key={obj}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            obj === 'LBA'
                              ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                              : obj === 'Targeted'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {obj === 'LBA' && <MapPin className="w-2.5 h-2.5" />}
                          {obj === 'Targeted' && <Target className="w-2.5 h-2.5" />}
                          {obj === 'Broadcast' && <Radio className="w-2.5 h-2.5" />}
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reach & Format Summary */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      Audiens: <strong className="text-slate-900 dark:text-white">{channel.audiensReach}</strong>
                    </span>
                    <button
                      onClick={() => handleSelectChannel(channel.id)}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Detail Saluran */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-700 shadow-2xl relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {selectedProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleSelectChannel(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Mockup Preview in Modal */}
              <div className="bg-black rounded-2xl p-3 border-2 border-slate-700 max-w-[280px] mx-auto shadow-md">
                <div className="rounded-xl overflow-hidden">
                  {selectedProduct.previewContent}
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">{selectedProduct.description}</p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider block">
                    Keunggulan Format:
                  </span>
                  <ul className="space-y-1 text-xs">
                    {selectedProduct.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setSelectedChannelId(null)}
                  className="w-full py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors"
                >
                  Tutup Informasi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
