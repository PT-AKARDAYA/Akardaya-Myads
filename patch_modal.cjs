const fs = require('fs');

const fileName = 'src/components/AdminDashboardModal.tsx';
let content = fs.readFileSync(fileName, 'utf-8');

const startMarker = "<div className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800\">";
const endMarker = "{/* TAB 5: TESTIMONIALS */}";
let actualEndMarker = endMarker;
if (!content.includes(endMarker)) {
  actualEndMarker = "{/* TAB 5: TESTIMONIALS & REVIEWS */}";
  if (!content.includes(actualEndMarker)) {
    actualEndMarker = "{/* TAB: TESTIMONI";
    if (!content.includes(actualEndMarker)) {
      actualEndMarker = "{/* TAB: LEADS";
      if (!content.includes(actualEndMarker)) {
        actualEndMarker = "{/* TAB 6:";
      }
    }
  }
}

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(actualEndMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  
  const newContent = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Lokasi Kantor Pusat & Kantor Cabang ({(draftData.offices || []).length})</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Data lokasi dikelola sepenuhnya melalui Google Spreadsheet dan disinkronkan secara otomatis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (typeof refreshData === 'function') {
                      await refreshData(false);
                      if (typeof showToast === 'function') showToast('Data lokasi tersinkronisasi dari Google Sheet', 'SUCCESS');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 dark:text-emerald-300 transition-colors shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sinkronisasi GSheet</span>
                </button>
              </div>

              {/* Office Cards List - Read Only */}
              <div className="space-y-4">
                {(draftData.offices || []).length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Data lokasi masih kosong.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Kelola data melalui Google Spreadsheet tab "offices" lalu sinkronkan.
                    </p>
                  </div>
                ) : (
                  (draftData.offices || []).map((office, index) => (
                    <div
                      key={office.id || index}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {office.name || 'Kantor'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                          {office.type === 'PUSAT' ? 'KANTOR PUSAT' : 'KANTOR CABANG'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Kota / Wilayah:</p>
                          <p className="font-bold text-slate-900 dark:text-white">{office.cityName || '-'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Koordinat (Lat, Lng):</p>
                          <p className="font-mono text-slate-900 dark:text-white">{office.latitude}, {office.longitude}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Alamat Lengkap:</p>
                          <p className="text-slate-900 dark:text-white">{office.address || '-'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Telepon & WhatsApp:</p>
                          <p className="text-slate-900 dark:text-white">{office.phone || '-'} / {office.whatsapp || '-'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">Jam Operasional:</p>
                          <p className="text-slate-900 dark:text-white">{office.operatingHours || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

`;
  
  fs.writeFileSync(fileName, before + newContent + after, 'utf-8');
  console.log('Patched modal successfully');
} else {
  console.log('Failed to patch modal', startIndex, endIndex, actualEndMarker);
}
