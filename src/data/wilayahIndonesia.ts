// Database Referensi Wilayah Indonesia Nasional (Provinsi, Kota/Kabupaten, Kecamatan, Kelurahan)
// Sumber data: Standar Kode Wilayah Kemendagri / BPS Indonesia

export interface WilayahProvinsi {
  id: string;
  nama: string;
}

export interface WilayahKota {
  id: string;
  provinsiId: string;
  nama: string;
  tipe: 'Kota' | 'Kabupaten';
}

export interface WilayahKecamatan {
  id: string;
  kotaId: string;
  nama: string;
}

export interface WilayahKelurahan {
  id: string;
  kecamatanId: string;
  nama: string;
  kodePos?: string;
}

// Data Wilayah Nasional Komprehensif
export const DAFTAR_PROVINSI: WilayahProvinsi[] = [
  { id: 'p_jatim', nama: 'Jawa Timur' },
  { id: 'p_dki', nama: 'DKI Jakarta' },
  { id: 'p_jabar', nama: 'Jawa Barat' },
  { id: 'p_jateng', nama: 'Jawa Tengah' },
  { id: 'p_banten', nama: 'Banten' },
  { id: 'p_diy', nama: 'DI Yogyakarta' },
  { id: 'p_bali', nama: 'Bali' },
  { id: 'p_sumut', nama: 'Sumatera Utara' },
  { id: 'p_sumsel', nama: 'Sumatera Selatan' },
  { id: 'p_sumbar', nama: 'Sumatera Barat' },
  { id: 'p_riau', nama: 'Riau' },
  { id: 'p_kepri', nama: 'Kepulauan Riau' },
  { id: 'p_lampung', nama: 'Lampung' },
  { id: 'p_kalsel', nama: 'Kalimantan Selatan' },
  { id: 'p_kaltim', nama: 'Kalimantan Timur' },
  { id: 'p_sulsel', nama: 'Sulawesi Selatan' },
  { id: 'p_sulut', nama: 'Sulawesi Utara' },
  { id: 'p_ntb', nama: 'Nusa Tenggara Barat' },
  { id: 'p_ntt', nama: 'Nusa Tenggara Timur' },
  { id: 'p_papua', nama: 'Papua' },
];

export const DAFTAR_KOTA: WilayahKota[] = [
  // Jawa Timur
  { id: 'k_gresik', provinsiId: 'p_jatim', nama: 'Kab. Gresik', tipe: 'Kabupaten' },
  { id: 'k_surabaya', provinsiId: 'p_jatim', nama: 'Kota Surabaya', tipe: 'Kota' },
  { id: 'k_sidoarjo', provinsiId: 'p_jatim', nama: 'Kab. Sidoarjo', tipe: 'Kabupaten' },
  { id: 'k_malang_kota', provinsiId: 'p_jatim', nama: 'Kota Malang', tipe: 'Kota' },
  { id: 'k_malang_kab', provinsiId: 'p_jatim', nama: 'Kab. Malang', tipe: 'Kabupaten' },
  { id: 'k_kediri_kota', provinsiId: 'p_jatim', nama: 'Kota Kediri', tipe: 'Kota' },
  { id: 'k_kediri_kab', provinsiId: 'p_jatim', nama: 'Kab. Kediri', tipe: 'Kabupaten' },
  { id: 'k_mojokerto_kota', provinsiId: 'p_jatim', nama: 'Kota Mojokerto', tipe: 'Kota' },
  { id: 'k_mojokerto_kab', provinsiId: 'p_jatim', nama: 'Kab. Mojokerto', tipe: 'Kabupaten' },
  { id: 'k_pasuruan_kota', provinsiId: 'p_jatim', nama: 'Kota Pasuruan', tipe: 'Kota' },
  { id: 'k_pasuruan_kab', provinsiId: 'p_jatim', nama: 'Kab. Pasuruan', tipe: 'Kabupaten' },
  { id: 'k_banyuwangi', provinsiId: 'p_jatim', nama: 'Kab. Banyuwangi', tipe: 'Kabupaten' },
  { id: 'k_jember', provinsiId: 'p_jatim', nama: 'Kab. Jember', tipe: 'Kabupaten' },
  { id: 'k_madiun_kota', provinsiId: 'p_jatim', nama: 'Kota Madiun', tipe: 'Kota' },
  { id: 'k_blitar_kota', provinsiId: 'p_jatim', nama: 'Kota Blitar', tipe: 'Kota' },
  { id: 'k_batu', provinsiId: 'p_jatim', nama: 'Kota Batu', tipe: 'Kota' },
  { id: 'k_tuban', provinsiId: 'p_jatim', nama: 'Kab. Tuban', tipe: 'Kabupaten' },
  { id: 'k_lamongan', provinsiId: 'p_jatim', nama: 'Kab. Lamongan', tipe: 'Kabupaten' },

  // DKI Jakarta
  { id: 'k_jakpus', provinsiId: 'p_dki', nama: 'Kota Jakarta Pusat', tipe: 'Kota' },
  { id: 'k_jaksel', provinsiId: 'p_dki', nama: 'Kota Jakarta Selatan', tipe: 'Kota' },
  { id: 'k_jaktim', provinsiId: 'p_dki', nama: 'Kota Jakarta Timur', tipe: 'Kota' },
  { id: 'k_jakbar', provinsiId: 'p_dki', nama: 'Kota Jakarta Barat', tipe: 'Kota' },
  { id: 'k_jakut', provinsiId: 'p_dki', nama: 'Kota Jakarta Utara', tipe: 'Kota' },

  // Jawa Barat
  { id: 'k_bandung_kota', provinsiId: 'p_jabar', nama: 'Kota Bandung', tipe: 'Kota' },
  { id: 'k_bandung_kab', provinsiId: 'p_jabar', nama: 'Kab. Bandung', tipe: 'Kabupaten' },
  { id: 'k_bekasi_kota', provinsiId: 'p_jabar', nama: 'Kota Bekasi', tipe: 'Kota' },
  { id: 'k_bekasi_kab', provinsiId: 'p_jabar', nama: 'Kab. Bekasi', tipe: 'Kabupaten' },
  { id: 'k_bogor_kota', provinsiId: 'p_jabar', nama: 'Kota Bogor', tipe: 'Kota' },
  { id: 'k_bogor_kab', provinsiId: 'p_jabar', nama: 'Kab. Bogor', tipe: 'Kabupaten' },
  { id: 'k_depok', provinsiId: 'p_jabar', nama: 'Kota Depok', tipe: 'Kota' },
  { id: 'k_cimahi', provinsiId: 'p_jabar', nama: 'Kota Cimahi', tipe: 'Kota' },
  { id: 'k_cirebon_kota', provinsiId: 'p_jabar', nama: 'Kota Cirebon', tipe: 'Kota' },
  { id: 'k_sukabumi_kota', provinsiId: 'p_jabar', nama: 'Kota Sukabumi', tipe: 'Kota' },
  { id: 'k_tasik_kota', provinsiId: 'p_jabar', nama: 'Kota Tasikmalaya', tipe: 'Kota' },

  // Jawa Tengah & DIY
  { id: 'k_semarang_kota', provinsiId: 'p_jateng', nama: 'Kota Semarang', tipe: 'Kota' },
  { id: 'k_surakarta', provinsiId: 'p_jateng', nama: 'Kota Surakarta (Solo)', tipe: 'Kota' },
  { id: 'k_magelang_kota', provinsiId: 'p_jateng', nama: 'Kota Magelang', tipe: 'Kota' },
  { id: 'k_pekalongan_kota', provinsiId: 'p_jateng', nama: 'Kota Pekalongan', tipe: 'Kota' },
  { id: 'k_tegal_kota', provinsiId: 'p_jateng', nama: 'Kota Tegal', tipe: 'Kota' },
  { id: 'k_banyumas', provinsiId: 'p_jateng', nama: 'Kab. Banyumas (Purwokerto)', tipe: 'Kabupaten' },
  { id: 'k_kudus', provinsiId: 'p_jateng', nama: 'Kab. Kudus', tipe: 'Kabupaten' },
  { id: 'k_jogja_kota', provinsiId: 'p_diy', nama: 'Kota Yogyakarta', tipe: 'Kota' },
  { id: 'k_sleman', provinsiId: 'p_diy', nama: 'Kab. Sleman', tipe: 'Kabupaten' },
  { id: 'k_bantul', provinsiId: 'p_diy', nama: 'Kab. Bantul', tipe: 'Kabupaten' },

  // Banten
  { id: 'k_tangerang_kota', provinsiId: 'p_banten', nama: 'Kota Tangerang', tipe: 'Kota' },
  { id: 'k_tangsel', provinsiId: 'p_banten', nama: 'Kota Tangerang Selatan', tipe: 'Kota' },
  { id: 'k_serang_kota', provinsiId: 'p_banten', nama: 'Kota Serang', tipe: 'Kota' },
  { id: 'k_cilegon', provinsiId: 'p_banten', nama: 'Kota Cilegon', tipe: 'Kota' },

  // Luar Jawa Populer
  { id: 'k_denpasar', provinsiId: 'p_bali', nama: 'Kota Denpasar', tipe: 'Kota' },
  { id: 'k_badung', provinsiId: 'p_bali', nama: 'Kab. Badung', tipe: 'Kabupaten' },
  { id: 'k_medan', provinsiId: 'p_sumut', nama: 'Kota Medan', tipe: 'Kota' },
  { id: 'k_palembang', provinsiId: 'p_sumsel', nama: 'Kota Palembang', tipe: 'Kota' },
  { id: 'k_padang', provinsiId: 'p_sumbar', nama: 'Kota Padang', tipe: 'Kota' },
  { id: 'k_pekanbaru', provinsiId: 'p_riau', nama: 'Kota Pekanbaru', tipe: 'Kota' },
  { id: 'k_batam', provinsiId: 'p_kepri', nama: 'Kota Batam', tipe: 'Kota' },
  { id: 'k_bandarlampung', provinsiId: 'p_lampung', nama: 'Kota Bandar Lampung', tipe: 'Kota' },
  { id: 'k_banjarmasin', provinsiId: 'p_kalsel', nama: 'Kota Banjarmasin', tipe: 'Kota' },
  { id: 'k_balikpapan', provinsiId: 'p_kaltim', nama: 'Kota Balikpapan', tipe: 'Kota' },
  { id: 'k_samarinda', provinsiId: 'p_kaltim', nama: 'Kota Samarinda', tipe: 'Kota' },
  { id: 'k_makassar', provinsiId: 'p_sulsel', nama: 'Kota Makassar', tipe: 'Kota' },
  { id: 'k_manado', provinsiId: 'p_sulut', nama: 'Kota Manado', tipe: 'Kota' },
  { id: 'k_mataram', provinsiId: 'p_ntb', nama: 'Kota Mataram', tipe: 'Kota' },
  { id: 'k_kupang', provinsiId: 'p_ntt', nama: 'Kota Kupang', tipe: 'Kota' },
  { id: 'k_jayapura', provinsiId: 'p_papua', nama: 'Kota Jayapura', tipe: 'Kota' },
];

export const DAFTAR_KECAMATAN: WilayahKecamatan[] = [
  // Gresik
  { id: 'kc_gresik_kota', kotaId: 'k_gresik', nama: 'Gresik' },
  { id: 'kc_kebomas', kotaId: 'k_gresik', nama: 'Kebomas' },
  { id: 'kc_manyar', kotaId: 'k_gresik', nama: 'Manyar' },
  { id: 'kc_cerme', kotaId: 'k_gresik', nama: 'Cerme' },
  { id: 'kc_driyorejo', kotaId: 'k_gresik', nama: 'Driyorejo' },
  { id: 'kc_menganti', kotaId: 'k_gresik', nama: 'Menganti' },
  { id: 'kc_benjeng', kotaId: 'k_gresik', nama: 'Benjeng' },
  { id: 'kc_balongpanggang', kotaId: 'k_gresik', nama: 'Balongpanggang' },
  { id: 'kc_duduksampeyan', kotaId: 'k_gresik', nama: 'Duduksampeyan' },
  { id: 'kc_bungah', kotaId: 'k_gresik', nama: 'Bungah' },
  { id: 'kc_sidayu', kotaId: 'k_gresik', nama: 'Sidayu' },
  { id: 'kc_dukun', kotaId: 'k_gresik', nama: 'Dukun' },
  { id: 'kc_panceng', kotaId: 'k_gresik', nama: 'Panceng' },
  { id: 'kc_ujungpangkah', kotaId: 'k_gresik', nama: 'Ujungpangkah' },
  { id: 'kc_wringinanom', kotaId: 'k_gresik', nama: 'Wringinanom' },
  { id: 'kc_kedamean', kotaId: 'k_gresik', nama: 'Kedamean' },
  { id: 'kc_sangkapura', kotaId: 'k_gresik', nama: 'Sangkapura (Bawean)' },
  { id: 'kc_tambak', kotaId: 'k_gresik', nama: 'Tambak (Bawean)' },

  // Surabaya
  { id: 'kc_sby_gubeng', kotaId: 'k_surabaya', nama: 'Gubeng' },
  { id: 'kc_sby_tegalsari', kotaId: 'k_surabaya', nama: 'Tegalsari' },
  { id: 'kc_sby_genteng', kotaId: 'k_surabaya', nama: 'Genteng' },
  { id: 'kc_sby_wonokromo', kotaId: 'k_surabaya', nama: 'Wonokromo' },
  { id: 'kc_sby_rungkut', kotaId: 'k_surabaya', nama: 'Rungkut' },
  { id: 'kc_sby_sukolilo', kotaId: 'k_surabaya', nama: 'Sukolilo' },
  { id: 'kc_sby_sawahan', kotaId: 'k_surabaya', nama: 'Sawahan' },
  { id: 'kc_sby_wiyung', kotaId: 'k_surabaya', nama: 'Wiyung' },
  { id: 'kc_sby_dukuhpakis', kotaId: 'k_surabaya', nama: 'Dukuh Pakis' },
  { id: 'kc_sby_kenjeran', kotaId: 'k_surabaya', nama: 'Kenjeran' },
  { id: 'kc_sby_tambaksari', kotaId: 'k_surabaya', nama: 'Tambaksari' },
  { id: 'kc_sby_simokerto', kotaId: 'k_surabaya', nama: 'Simokerto' },
  { id: 'kc_sby_pabeancantikan', kotaId: 'k_surabaya', nama: 'Pabean Cantikan' },
  { id: 'kc_sby_semampir', kotaId: 'k_surabaya', nama: 'Semampir' },
  { id: 'kc_sby_krembangan', kotaId: 'k_surabaya', nama: 'Krembangan' },
  { id: 'kc_sby_sukomanunggal', kotaId: 'k_surabaya', nama: 'Sukomanunggal' },
  { id: 'kc_sby_tandes', kotaId: 'k_surabaya', nama: 'Tandes' },
  { id: 'kc_sby_sambikerep', kotaId: 'k_surabaya', nama: 'Sambikerep' },
  { id: 'kc_sby_lakarsantri', kotaId: 'k_surabaya', nama: 'Lakarsantri' },
  { id: 'kc_sby_benowo', kotaId: 'k_surabaya', nama: 'Benowo' },
  { id: 'kc_sby_pakal', kotaId: 'k_surabaya', nama: 'Pakal' },
  { id: 'kc_sby_jambangan', kotaId: 'k_surabaya', nama: 'Jambangan' },
  { id: 'kc_sby_gayungan', kotaId: 'k_surabaya', nama: 'Gayungan' },
  { id: 'kc_sby_wonocolo', kotaId: 'k_surabaya', nama: 'Wonocolo' },
  { id: 'kc_sby_tenggilis', kotaId: 'k_surabaya', nama: 'Tenggilis Mejoyo' },
  { id: 'kc_sby_gununganyar', kotaId: 'k_surabaya', nama: 'Gunung Anyar' },
  { id: 'kc_sby_mulyorejo', kotaId: 'k_surabaya', nama: 'Mulyorejo' },
  { id: 'kc_sby_bulak', kotaId: 'k_surabaya', nama: 'Bulak' },

  // Sidoarjo
  { id: 'kc_sda_kota', kotaId: 'k_sidoarjo', nama: 'Sidoarjo' },
  { id: 'kc_sda_waru', kotaId: 'k_sidoarjo', nama: 'Waru' },
  { id: 'kc_sda_gedangan', kotaId: 'k_sidoarjo', nama: 'Gedangan' },
  { id: 'kc_sda_buduran', kotaId: 'k_sidoarjo', nama: 'Buduran' },
  { id: 'kc_sda_candi', kotaId: 'k_sidoarjo', nama: 'Candi' },
  { id: 'kc_sda_tanggulangin', kotaId: 'k_sidoarjo', nama: 'Tanggulangin' },
  { id: 'kc_sda_porong', kotaId: 'k_sidoarjo', nama: 'Porong' },
  { id: 'kc_sda_krian', kotaId: 'k_sidoarjo', nama: 'Krian' },
  { id: 'kc_sda_taman', kotaId: 'k_sidoarjo', nama: 'Taman' },
  { id: 'kc_sda_sukodono', kotaId: 'k_sidoarjo', nama: 'Sukodono' },
  { id: 'kc_sda_sedati', kotaId: 'k_sidoarjo', nama: 'Sedati' },

  // Jakarta Pusat
  { id: 'kc_jakpus_gambir', kotaId: 'k_jakpus', nama: 'Gambir' },
  { id: 'kc_jakpus_menteng', kotaId: 'k_jakpus', nama: 'Menteng' },
  { id: 'kc_jakpus_tanahabang', kotaId: 'k_jakpus', nama: 'Tanah Abang' },
  { id: 'kc_jakpus_senen', kotaId: 'k_jakpus', nama: 'Senen' },
  { id: 'kc_jakpus_cempakaputih', kotaId: 'k_jakpus', nama: 'Cempaka Putih' },
  { id: 'kc_jakpus_kemayoran', kotaId: 'k_jakpus', nama: 'Kemayoran' },

  // Jakarta Selatan
  { id: 'kc_jaksel_kebayoranbaru', kotaId: 'k_jaksel', nama: 'Kebayoran Baru' },
  { id: 'kc_jaksel_kebayoranlama', kotaId: 'k_jaksel', nama: 'Kebayoran Lama' },
  { id: 'kc_jaksel_cilandak', kotaId: 'k_jaksel', nama: 'Cilandak' },
  { id: 'kc_jaksel_mampang', kotaId: 'k_jaksel', nama: 'Mampang Prapatan' },
  { id: 'kc_jaksel_setiabudi', kotaId: 'k_jaksel', nama: 'Setiabudi' },
  { id: 'kc_jaksel_tebet', kotaId: 'k_jaksel', nama: 'Tebet' },
  { id: 'kc_jaksel_pasarminggu', kotaId: 'k_jaksel', nama: 'Pasar Minggu' },
  { id: 'kc_jaksel_jagakarsa', kotaId: 'k_jaksel', nama: 'Jagakarsa' },
  { id: 'kc_jaksel_pesanggrahan', kotaId: 'k_jaksel', nama: 'Pesanggrahan' },

  // Bandung Kota
  { id: 'kc_bdg_coblong', kotaId: 'k_bandung_kota', nama: 'Coblong' },
  { id: 'kc_bdg_sukajadi', kotaId: 'k_bandung_kota', nama: 'Sukajadi' },
  { id: 'kc_bdg_sumurbdg', kotaId: 'k_bandung_kota', nama: 'Sumur Bandung' },
  { id: 'kc_bdg_lengkong', kotaId: 'k_bandung_kota', nama: 'Lengkong' },
  { id: 'kc_bdg_buahbatu', kotaId: 'k_bandung_kota', nama: 'Buahbatu' },
  { id: 'kc_bdg_antapani', kotaId: 'k_bandung_kota', nama: 'Antapani' },
  { id: 'kc_bdg_cicendo', kotaId: 'k_bandung_kota', nama: 'Cicendo' },
  { id: 'kc_bdg_cibeunyingkaler', kotaId: 'k_bandung_kota', nama: 'Cibeunying Kaler' },

  // Kota Semarang
  { id: 'kc_smg_semarangtengah', kotaId: 'k_semarang_kota', nama: 'Semarang Tengah' },
  { id: 'kc_smg_semarangselatan', kotaId: 'k_semarang_kota', nama: 'Semarang Selatan' },
  { id: 'kc_smg_semarangbarat', kotaId: 'k_semarang_kota', nama: 'Semarang Barat' },
  { id: 'kc_smg_semarangutara', kotaId: 'k_semarang_kota', nama: 'Semarang Utara' },
  { id: 'kc_smg_semarangtimur', kotaId: 'k_semarang_kota', nama: 'Semarang Timur' },
  { id: 'kc_smg_candisari', kotaId: 'k_semarang_kota', nama: 'Candisari' },
  { id: 'kc_smg_banyumanik', kotaId: 'k_semarang_kota', nama: 'Banyumanik' },
  { id: 'kc_smg_pedurungan', kotaId: 'k_semarang_kota', nama: 'Pedurungan' },

  // Medan
  { id: 'kc_medan_kota', kotaId: 'k_medan', nama: 'Medan Kota' },
  { id: 'kc_medan_barat', kotaId: 'k_medan', nama: 'Medan Barat' },
  { id: 'kc_medan_petisah', kotaId: 'k_medan', nama: 'Medan Petisah' },
  { id: 'kc_medan_polonia', kotaId: 'k_medan', nama: 'Medan Polonia' },
  { id: 'kc_medan_selayang', kotaId: 'k_medan', nama: 'Medan Selayang' },
  { id: 'kc_medan_sunggal', kotaId: 'k_medan', nama: 'Medan Sunggal' },
  { id: 'kc_medan_amplas', kotaId: 'k_medan', nama: 'Medan Amplas' },

  // Makassar
  { id: 'kc_mks_ujungpandang', kotaId: 'k_makassar', nama: 'Ujung Pandang' },
  { id: 'kc_mks_panakkukang', kotaId: 'k_makassar', nama: 'Panakkukang' },
  { id: 'kc_mks_rappocini', kotaId: 'k_makassar', nama: 'Rappocini' },
  { id: 'kc_mks_tamalanrea', kotaId: 'k_makassar', nama: 'Tamalanrea' },
  { id: 'kc_mks_mariso', kotaId: 'k_makassar', nama: 'Mariso' },

  // Denpasar
  { id: 'kc_dps_selatan', kotaId: 'k_denpasar', nama: 'Denpasar Selatan (Sanur)' },
  { id: 'kc_dps_barat', kotaId: 'k_denpasar', nama: 'Denpasar Barat' },
  { id: 'kc_dps_utara', kotaId: 'k_denpasar', nama: 'Denpasar Utara' },
  { id: 'kc_dps_timur', kotaId: 'k_denpasar', nama: 'Denpasar Timur' },
];

export const DAFTAR_KELURAHAN: WilayahKelurahan[] = [
  // Gresik - Kc. Gresik
  { id: 'kl_grs_bedilan', kecamatanId: 'kc_gresik_kota', nama: 'Bedilan', kodePos: '61111' },
  { id: 'kl_grs_kroman', kecamatanId: 'kc_gresik_kota', nama: 'Kroman', kodePos: '61112' },
  { id: 'kl_grs_lumpur', kecamatanId: 'kc_gresik_kota', nama: 'Lumpur', kodePos: '61113' },
  { id: 'kl_grs_sidokumpul', kecamatanId: 'kc_gresik_kota', nama: 'Sidokumpul', kodePos: '61114' },
  { id: 'kl_grs_trate', kecamatanId: 'kc_gresik_kota', nama: 'Trate', kodePos: '61115' },
  { id: 'kl_grs_sukorame', kecamatanId: 'kc_gresik_kota', nama: 'Sukorame', kodePos: '61116' },
  { id: 'kl_grs_karangpoh', kecamatanId: 'kc_gresik_kota', nama: 'Karangpoh', kodePos: '61117' },
  { id: 'kl_grs_pekelingan', kecamatanId: 'kc_gresik_kota', nama: 'Pekelingan', kodePos: '61118' },

  // Gresik - Kc. Kebomas
  { id: 'kl_kbm_dahanrejo', kecamatanId: 'kc_kebomas', nama: 'Dahanrejo', kodePos: '61121' },
  { id: 'kl_kbm_giri', kecamatanId: 'kc_kebomas', nama: 'Giri', kodePos: '61122' },
  { id: 'kl_kbm_gulomantung', kecamatanId: 'kc_kebomas', nama: 'Gulomantung', kodePos: '61123' },
  { id: 'kl_kbm_kedanyang', kecamatanId: 'kc_kebomas', nama: 'Kedanyang', kodePos: '61124' },
  { id: 'kl_kbm_kembangan', kecamatanId: 'kc_kebomas', nama: 'Kembangan', kodePos: '61125' },
  { id: 'kl_kbm_sekarteja', kecamatanId: 'kc_kebomas', nama: 'Sekarkurung', kodePos: '61126' },
  { id: 'kl_kbm_singosari', kecamatanId: 'kc_kebomas', nama: 'Singosari', kodePos: '61127' },
  { id: 'kl_kbm_kebomas', kecamatanId: 'kc_kebomas', nama: 'Kebomas', kodePos: '61128' },

  // Gresik - Kc. Manyar
  { id: 'kl_myr_manyarejo', kecamatanId: 'kc_manyar', nama: 'Manyarejo', kodePos: '61151' },
  { id: 'kl_myr_manyarsidorukun', kecamatanId: 'kc_manyar', nama: 'Manyar Sidorukun', kodePos: '61151' },
  { id: 'kl_myr_manyarsidomukti', kecamatanId: 'kc_manyar', nama: 'Manyar Sidomukti', kodePos: '61151' },
  { id: 'kl_myr_suci', kecamatanId: 'kc_manyar', nama: 'Suci', kodePos: '61151' },
  { id: 'kl_myr_tebalo', kecamatanId: 'kc_manyar', nama: 'Tebalo', kodePos: '61151' },
  { id: 'kl_myr_yosowilangun', kecamatanId: 'kc_manyar', nama: 'Yosowilangun', kodePos: '61151' },
  { id: 'kl_myr_pelemwatu', kecamatanId: 'kc_manyar', nama: 'Peganden', kodePos: '61151' },
  { id: 'kl_myr_banyuwangi', kecamatanId: 'kc_manyar', nama: 'Banyuwangi', kodePos: '61151' },

  // Surabaya - Kc. Gubeng
  { id: 'kl_sby_gubeng', kecamatanId: 'kc_sby_gubeng', nama: 'Gubeng', kodePos: '60281' },
  { id: 'kl_sby_kertajaya', kecamatanId: 'kc_sby_gubeng', nama: 'Kertajaya', kodePos: '60282' },
  { id: 'kl_sby_pucangsewu', kecamatanId: 'kc_sby_gubeng', nama: 'Pucang Sewu', kodePos: '60283' },
  { id: 'kl_sby_baratajaya', kecamatanId: 'kc_sby_gubeng', nama: 'Barata Jaya', kodePos: '60284' },
  { id: 'kl_sby_mojo', kecamatanId: 'kc_sby_gubeng', nama: 'Mojo', kodePos: '60285' },
  { id: 'kl_sby_airlangga', kecamatanId: 'kc_sby_gubeng', nama: 'Airlangga', kodePos: '60286' },

  // Surabaya - Kc. Tegalsari
  { id: 'kl_sby_kedungdoro', kecamatanId: 'kc_sby_tegalsari', nama: 'Kedungdoro', kodePos: '60261' },
  { id: 'kl_sby_tegalsari_kl', kecamatanId: 'kc_sby_tegalsari', nama: 'Tegalsari', kodePos: '60262' },
  { id: 'kl_sby_wonorejo', kecamatanId: 'kc_sby_tegalsari', nama: 'Wonorejo', kodePos: '60263' },
  { id: 'kl_sby_drsoetomo', kecamatanId: 'kc_sby_tegalsari', nama: 'Dr. Soetomo', kodePos: '60264' },
  { id: 'kl_sby_keputran', kecamatanId: 'kc_sby_tegalsari', nama: 'Keputran', kodePos: '60265' },

  // Surabaya - Kc. Wonokromo
  { id: 'kl_sby_wonokromo_kl', kecamatanId: 'kc_sby_wonokromo', nama: 'Wonokromo', kodePos: '60241' },
  { id: 'kl_sby_darmo', kecamatanId: 'kc_sby_wonokromo', nama: 'Darmo', kodePos: '60241' },
  { id: 'kl_sby_jagir', kecamatanId: 'kc_sby_wonokromo', nama: 'Jagir', kodePos: '60244' },
  { id: 'kl_sby_ngagel', kecamatanId: 'kc_sby_wonokromo', nama: 'Ngagel', kodePos: '60246' },
  { id: 'kl_sby_ngagelrejo', kecamatanId: 'kc_sby_wonokromo', nama: 'Ngagelrejo', kodePos: '60245' },

  // Surabaya - Kc. Rungkut
  { id: 'kl_sby_kalirungkut', kecamatanId: 'kc_sby_rungkut', nama: 'Kali Rungkut', kodePos: '60293' },
  { id: 'kl_sby_rungkutkidul', kecamatanId: 'kc_sby_rungkut', nama: 'Rungkut Kidul', kodePos: '60293' },
  { id: 'kl_sby_medokanayu', kecamatanId: 'kc_sby_rungkut', nama: 'Medokan Ayu', kodePos: '60295' },
  { id: 'kl_sby_penjaringansari', kecamatanId: 'kc_sby_rungkut', nama: 'Penjaringan Sari', kodePos: '60297' },
  { id: 'kl_sby_kedungbaruk', kecamatanId: 'kc_sby_rungkut', nama: 'Kedung Baruk', kodePos: '60298' },

  // Sidoarjo - Waru
  { id: 'kl_sda_waru_kl', kecamatanId: 'kc_sda_waru', nama: 'Waru', kodePos: '61256' },
  { id: 'kl_sda_bungurasih', kecamatanId: 'kc_sda_waru', nama: 'Bungurasih', kodePos: '61256' },
  { id: 'kl_sda_kureksari', kecamatanId: 'kc_sda_waru', nama: 'Kureksari', kodePos: '61256' },
  { id: 'kl_sda_pepelegi', kecamatanId: 'kc_sda_waru', nama: 'Pepelegi', kodePos: '61256' },
  { id: 'kl_sda_tropodo', kecamatanId: 'kc_sda_waru', nama: 'Tropodo', kodePos: '61256' },

  // Jakarta Pusat - Menteng
  { id: 'kl_jkt_menteng', kecamatanId: 'kc_jakpus_menteng', nama: 'Menteng', kodePos: '10310' },
  { id: 'kl_jkt_pegangsaan', kecamatanId: 'kc_jakpus_menteng', nama: 'Pegangsaan', kodePos: '10320' },
  { id: 'kl_jkt_cikini', kecamatanId: 'kc_jakpus_menteng', nama: 'Cikini', kodePos: '10330' },
  { id: 'kl_jkt_gondangdia', kecamatanId: 'kc_jakpus_menteng', nama: 'Gondangdia', kodePos: '10350' },
  { id: 'kl_jkt_kebonsirih', kecamatanId: 'kc_jakpus_menteng', nama: 'Kebon Sirih', kodePos: '10340' },

  // Jakarta Selatan - Kebayoran Baru
  { id: 'kl_jkt_senayan', kecamatanId: 'kc_jaksel_kebayoranbaru', nama: 'Senayan', kodePos: '12190' },
  { id: 'kl_jkt_selong', kecamatanId: 'kc_jaksel_kebayoranbaru', nama: 'Selong', kodePos: '12110' },
  { id: 'kl_jkt_gunung', kecamatanId: 'kc_jaksel_kebayoranbaru', nama: 'Gunung', kodePos: '12120' },
  { id: 'kl_jkt_melawai', kecamatanId: 'kc_jaksel_kebayoranbaru', nama: 'Melawai', kodePos: '12160' },
  { id: 'kc_jkt_petogogan', kecamatanId: 'kc_jaksel_kebayoranbaru', nama: 'Petogogan', kodePos: '12170' },

  // Bandung - Coblong
  { id: 'kl_bdg_dago', kecamatanId: 'kc_bdg_coblong', nama: 'Dago', kodePos: '40135' },
  { id: 'kl_bdg_lebakgede', kecamatanId: 'kc_bdg_coblong', nama: 'Lebak Gede', kodePos: '40132' },
  { id: 'kl_bdg_sekeloa', kecamatanId: 'kc_bdg_coblong', nama: 'Sekeloa', kodePos: '40134' },
  { id: 'kl_bdg_sadangserang', kecamatanId: 'kc_bdg_coblong', nama: 'Sadang Serang', kodePos: '40133' },
];
