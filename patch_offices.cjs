const fs = require('fs');

const fileNames = ['src/AdminApp.tsx', 'src/components/AdminDashboardModal.tsx'];

for (const fileName of fileNames) {
  let content = fs.readFileSync(fileName, 'utf-8');

  // Replace everything between {/* TAB: OFFICES & GOOGLE MAPS CONFIGURATION */} and {/* TAB 5: TESTIMONIALS */}
  
  const startMarker = "{/* TAB: OFFICES & GOOGLE MAPS CONFIGURATION */}";
  const endMarker = "{/* TAB 5: TESTIMONIALS */}";
  const endMarkerAlt = "{/* TAB: TESTIMONIALS */}";
  const endMarkerAlt2 = "{/* TAB: TESTIMONI */}";
  const endMarkerAlt3 = "{/* TAB: LEADS */}";
  
  let actualEndMarker = endMarker;
  if (!content.includes(actualEndMarker)) {
    if (content.includes(endMarkerAlt)) actualEndMarker = endMarkerAlt;
    else if (content.includes(endMarkerAlt2)) actualEndMarker = endMarkerAlt2;
    else if (content.includes(endMarkerAlt3)) actualEndMarker = endMarkerAlt3;
    else if (content.includes("{/* TAB: LEADS")) actualEndMarker = "{/* TAB: LEADS";
  }

  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(actualEndMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    
    const newContent = `          {/* TAB: OFFICES & GOOGLE MAPS CONFIGURATION */}
          {activeTab === 'OFFICES' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Lokasi Kantor Pusat & Cabang ({(draftData.offices || []).length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Data lokasi dikelola sepenuhnya melalui Google Spreadsheet dan disinkronkan ke aplikasi.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (typeof refreshData === 'function') {
                      await refreshData(false);
                      if (typeof showToast === 'function') showToast('Data lokasi terbaru telah ditarik dari Google Sheet', 'SUCCESS');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/60 dark:text-emerald-300 transition-colors shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sinkronisasi GSheet</span>
                </button>
              </div>

              {/* Office Cards - Read Only Mode */}
              <div className="space-y-4">
                {(draftData.offices || []).length === 0 ? (
                  <div className="p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Data lokasi masih kosong.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Silakan kelola data ini di Google Spreadsheet pada tab "offices", lalu tekan tombol sinkronisasi.
                    </p>
                  </div>
                ) : (
                  (draftData.offices || []).map((office, idx) => (
                    <div
                      key={office.id || idx}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {office.name || 'Kantor Cabang Baru'}
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

                      {/* Live Preview */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-blue-500" />
                            Titik Peta Google Maps
                          </span>
                          <a
                            href={\`https://www.google.com/maps?q=\${office.latitude},\${office.longitude}\`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka Google Maps</span>
                          </a>
                        </div>
                        <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                          <iframe
                            title={\`Preview \${office.name}\`}
                            src={\`https://www.google.com/maps?q=\${office.latitude},\${office.longitude}&hl=id&z=15&output=embed\`}
                            className="w-full h-full border-0"
                            loading="lazy"
                          />
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
    console.log('Patched', fileName);
  } else {
    console.log('Failed to patch', fileName, startIndex, endIndex);
  }
}
