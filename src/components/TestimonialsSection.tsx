import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  MessageSquareQuote,
  CheckCircle2,
  PlusCircle,
  X,
  Send,
  Building2,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TestimonialsSection: React.FC = () => {
  const { data, submitReview } = useApp();
  const { testimonials, packages } = data;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [companyOrStore, setCompanyOrStore] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(packages[0]?.name || 'Paket Jawara UMKM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    const success = await submitReview({
      name: name.trim(),
      companyOrStore: companyOrStore.trim() || 'Bisnis Lokal',
      role: role.trim() || 'Owner',
      rating,
      comment: comment.trim(),
      packageName: selectedPackage,
    });

    setIsSubmitting(false);
    if (success) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setIsModalOpen(false);
      setName('');
      setCompanyOrStore('');
      setRole('');
      setComment('');
    }
  };

  return (
    <section id="section-testimonials" className="py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Ulasan & Testimoni Pelanggan Setia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Kisah Sukses Promosi & Testimoni Nyata
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Ribuan pemilik toko, pelaku UMKM, dan korporasi telah membuktikan lonjakan penjualan menggunakan saluran iklan resmi kami.
            </p>
          </div>

          {/* Add Review Action */}
          <button
            id="btn-open-add-review-modal"
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tulis Testimoni Anda</span>
          </button>
        </div>

        {/* Testimonials Grid or Empty State */}
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                id={`testimonial-card-${t.id}`}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Rating & Verified Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < t.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    {t.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        Terverifikasi
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>

                {/* Author & Package Tag */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${
                        t.avatarBgColor || 'bg-blue-600'
                      } text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {t.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.role} · {t.companyOrStore}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0 text-right truncate max-w-[120px]">
                    {t.packageName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-850/60 max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Belum Ada Ulasan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Jadilah yang pertama membagikan pengalaman sukses promosi iklan bersama {data.companyConfig.brandName}.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tulis Ulasan Pertama</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal: Write Testimonial */}
      {isModalOpen && (
        <div
          id="modal-add-testimonial"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tulis Ulasan & Pengalaman Iklan
                </h3>
              </div>
              <button
                id="btn-close-testimonial-modal"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Beri Rating Kepuasan:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                    {rating} dari 5 Bintang
                  </span>
                </div>
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Pratama"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Bisnis / Toko
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kedai Kopi Nusantara"
                    value={companyOrStore}
                    onChange={(e) => setCompanyOrStore(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jabatan / Peran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Owner / Digital Marketer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paket yang Digunakan
                  </label>
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    <option value="Paket Custom MyAds">Paket Custom MyAds</option>
                  </select>
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ulasan & Hasil Promosi *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ceritakan bagaimana performa broadcast, layanan tim, dan respon pembeli setelah beriklan..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Terbitkan Testimoni'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
