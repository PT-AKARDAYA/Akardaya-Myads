import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  X,
  Compass,
  AlertCircle,
  Loader2,
  Building,
  Target,
  Layers,
  RotateCcw,
  RefreshCw,
  Eye,
  Globe
} from 'lucide-react';

interface GpsLocationResult {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  streetAddress: string;
  cityName: string;
  formattedTargetArea: string;
}

interface GpsLocationMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (result: GpsLocationResult) => void;
  initialLat?: number;
  initialLng?: number;
  initialRadius?: number; // meters, default 1000
  initialAddress?: string;
}

// Fix default leaflet marker icon
const customIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #ffffff; box-shadow: 0 8px 16px -2px rgba(37,99,235,0.45), 0 4px 6px -4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
        <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
      </div>
      <div style="position: absolute; bottom: -6px; width: 12px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1px);"></div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

type MapStyleType = 'voyager' | 'osm' | 'satellite';

const TILE_LAYERS: Record<MapStyleType, { url: string; subdomains?: string[]; attribution: string; maxZoom: number }> = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19,
  },
};

export const GpsLocationMapPickerModal: React.FC<GpsLocationMapPickerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLat = -7.2575, // Default Surabaya / Jawa Timur
  initialLng = 112.7521,
  initialRadius = 1000,
  initialAddress = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [lat, setLat] = useState<number>(initialLat);
  const [lng, setLng] = useState<number>(initialLng);
  const [radiusMeters, setRadiusMeters] = useState<number>(initialRadius || 1000);
  const [streetAddress, setStreetAddress] = useState<string>(initialAddress);
  const [cityName, setCityName] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleType>('voyager');

  // Synchronize state when modal opens
  useEffect(() => {
    if (isOpen) {
      const validLat = initialLat && !isNaN(initialLat) ? initialLat : -7.2575;
      const validLng = initialLng && !isNaN(initialLng) ? initialLng : 112.7521;
      const validRad = Math.min(3000, Math.max(300, initialRadius || 1000));

      setLat(validLat);
      setLng(validLng);
      setRadiusMeters(validRad);
      setStreetAddress(initialAddress || '');
      setGpsError(null);
      setSearchResults([]);
      setSearchQuery('');

      if (!initialAddress) {
        reverseGeocode(validLat, validLng);
      }
    }
  }, [isOpen, initialLat, initialLng, initialRadius, initialAddress]);

  // Reverse Geocoding using OpenStreetMap Nominatim
  const reverseGeocode = async (latitude: number, longitude: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'id,en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.pedestrian || data.address?.suburb || '';
        const district = data.address?.suburb || data.address?.city_district || data.address?.village || '';
        const city = data.address?.city || data.address?.county || data.address?.state_district || 'Kota';
        const display = data.display_name || `${road}, ${city}`;

        const shortAddr = [road, district, city].filter(Boolean).join(', ') || display;
        setStreetAddress(shortAddr);
        setCityName(city);
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Switch Tile Layer
  const setLayerStyle = useCallback((style: MapStyleType) => {
    setMapStyle(style);
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const cfg = TILE_LAYERS[style];
    const newLayer = L.tileLayer(cfg.url, {
      subdomains: cfg.subdomains || 'abc',
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      crossOrigin: true,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, []);

  // Invalidate map size safely
  const triggerMapResize = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.invalidateSize({ pan: false });
      } catch (e) {
        console.warn('Leaflet invalidateSize error:', e);
      }
    }
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
      return;
    }

    let resizeObserver: ResizeObserver | null = null;

    const initTimer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 15,
          zoomControl: false,
          preferCanvas: true,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const cfg = TILE_LAYERS[mapStyle];
        const tileLayer = L.tileLayer(cfg.url, {
          subdomains: cfg.subdomains || 'abc',
          attribution: cfg.attribution,
          maxZoom: cfg.maxZoom,
          crossOrigin: true,
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        // Marker
        const marker = L.marker([lat, lng], {
          icon: customIcon,
          draggable: true,
        }).addTo(map);

        // Radius Circle
        const circle = L.circle([lat, lng], {
          radius: radiusMeters,
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.18,
          weight: 2.5,
          dashArray: '6, 6',
        }).addTo(map);

        // Marker Drag End Handler
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setLat(pos.lat);
          setLng(pos.lng);
          circle.setLatLng(pos);
          reverseGeocode(pos.lat, pos.lng);
        });

        // Map Click Handler
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat: clickedLat, lng: clickedLng } = e.latlng;
          setLat(clickedLat);
          setLng(clickedLng);
          marker.setLatLng([clickedLat, clickedLng]);
          circle.setLatLng([clickedLat, clickedLng]);
          reverseGeocode(clickedLat, clickedLng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        circleRef.current = circle;
      } else {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([lat, lng]);
        markerRef.current?.setLatLng([lat, lng]);
        circleRef.current?.setLatLng([lat, lng]);
        circleRef.current?.setRadius(radiusMeters);
      }

      // Guarantee tile rendering
      [50, 150, 300, 600, 1200].forEach((delay) => {
        setTimeout(triggerMapResize, delay);
      });

      // Observe container resize
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          triggerMapResize();
        });
        resizeObserver.observe(mapContainerRef.current);
      }
    }, 60);

    return () => {
      clearTimeout(initTimer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isOpen]);

  // Update circle radius when slider changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusMeters);
    }
  }, [radiusMeters]);

  // Move marker & circle when lat/lng update externally (e.g. from GPS or Search)
  const updateMapPosition = (newLat: number, newLng: number, newRadius?: number) => {
    setLat(newLat);
    setLng(newLng);
    if (newRadius !== undefined) setRadiusMeters(newRadius);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 15);
      markerRef.current?.setLatLng([newLat, newLng]);
      circleRef.current?.setLatLng([newLat, newLng]);
      if (newRadius !== undefined) circleRef.current?.setRadius(newRadius);
      triggerMapResize();
    }
    reverseGeocode(newLat, newLng);
  };

  // Center on current pin
  const handleRecenterPin = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      triggerMapResize();
    }
  };

  // "Gunakan Lokasi Saya (GPS)" Handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser tidak mendukung pendeteksi GPS / Lokasi.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        updateMapPosition(latitude, longitude);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Gagal mendeteksi lokasi GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Izin lokasi GPS ditolak di browser. Silakan ketik nama lokasi atau geser pin di peta.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Informasi lokasi perangkat tidak tersedia saat ini.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Waktu permintaan lokasi GPS habis.';
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Search Address / Place Name
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGpsError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=id&limit=5`,
        { headers: { 'Accept-Language': 'id,en' } }
      );
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results || []);
        if (!results || results.length === 0) {
          setGpsError(`Lokasi "${searchQuery}" tidak ditemukan. Coba gunakan kata kunci lain.`);
        }
      }
    } catch (err) {
      console.warn('Search error:', err);
      setGpsError('Gagal mencari lokasi. Periksa koneksi internet Anda.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    if (!isNaN(newLat) && !isNaN(newLng)) {
      setStreetAddress(result.display_name);
      setSearchResults([]);
      setSearchQuery('');
      updateMapPosition(newLat, newLng);
    }
  };

  // Radius Preset Buttons
  const radiusPresets = [
    { label: '300m', meters: 300 },
    { label: '500m', meters: 500 },
    { label: '1 km', meters: 1000 },
    { label: '1.5 km', meters: 1500 },
    { label: '2 km', meters: 2000 },
    { label: '3 km', meters: 3000 },
  ];

  const handleSaveLocation = () => {
    const formattedTarget = streetAddress.trim()
      ? `${streetAddress.trim()} (Radius: ${radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1).replace('.0', '')} km` : `${radiusMeters}m`})`
      : `Koordinat ${lat.toFixed(5)}, ${lng.toFixed(5)} (Radius: ${radiusMeters}m)`;

    onSave({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      radiusMeters,
      streetAddress: streetAddress.trim() || `Titik Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      cityName: cityName.trim(),
      formattedTargetArea: formattedTarget,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[88vh] h-[92vh] sm:h-auto overflow-hidden">
        {/* 1. Header (Fixed Height, Shrink-0) */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/25 shrink-0">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-base leading-tight truncate">
                Pilih Titik Lokasi & Radius LBA (GPS)
              </h3>
              <p className="text-[10px] sm:text-[11px] text-blue-100 truncate">
                Geser pin atau klik di peta untuk menentukan target sasaran
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Search Bar & Quick Location Button (Shrink-0) */}
        <div className="p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 space-y-1.5 shrink-0 z-20">
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari jalan, mall, toko, atau nama kota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-16 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cari'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="py-1.5 px-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-2xs"
            >
              {isLocating ? (
                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              ) : (
                <Navigation className="w-3 h-3 text-blue-600" />
              )}
              <span className="text-[11px]">{isLocating ? 'Mencari...' : 'Lokasi Saya'}</span>
            </button>
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="p-1 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900 shadow-lg space-y-1 max-h-32 overflow-y-auto z-30">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full p-1.5 text-left text-xs rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-start gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span className="line-clamp-2 text-[11px]">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {gpsError && (
            <div className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* 3. Flexible Interactive Map Area (Fills remaining height) */}
        <div className="relative flex-1 min-h-[160px] sm:min-h-[220px] max-h-[300px] sm:max-h-[360px] bg-slate-100 dark:bg-slate-950 overflow-hidden border-b border-slate-200 dark:border-slate-800">
          {/* Leaflet Map DOM Element */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

          {/* Quick instructions badge */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <div className="px-2 py-0.5 rounded-lg bg-slate-900/85 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-semibold flex items-center gap-1 shadow-md border border-white/20">
              <Compass className="w-3 h-3 text-blue-400" />
              <span>Geser pin / klik peta</span>
            </div>
          </div>

          {/* Live Radius badge on top right */}
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
            <div className="px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-extrabold shadow-md flex items-center gap-1 border border-white/20">
              <span>Radius:</span>
              <span>{radiusMeters >= 1000 ? `${(radiusMeters / 1000).toFixed(1).replace('.0', '')} km` : `${radiusMeters}m`}</span>
            </div>
          </div>

          {/* Map Layer Switcher & Recenter */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-0.5 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setLayerStyle('voyager')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  mapStyle === 'voyager'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Peta Jalan
              </button>
              <button
                type="button"
                onClick={() => setLayerStyle('osm')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  mapStyle === 'osm'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                OSM
              </button>
              <button
                type="button"
                onClick={() => setLayerStyle('satellite')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  mapStyle === 'satellite'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Satelit
              </button>
            </div>

            <button
              type="button"
              onClick={handleRecenterPin}
              title="Tengahkan Pin"
              className="p-1 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-md border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 4. Controls & Inputs Area (Scrollable if viewport is tight, shrink-0) */}
        <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 space-y-2 overflow-y-auto shrink-0 max-h-[30vh]">
          {/* Radius Slider Row */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>Radius Sasaran Iklan:</span>
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xs">
                {radiusMeters >= 1000
                  ? `${(radiusMeters / 1000).toFixed(1).replace('.0', '')} km (${radiusMeters}m)`
                  : `${radiusMeters} Meter`}
              </span>
            </div>

            {/* Compact Slider & Chips */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={300}
                max={3000}
                step={100}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex items-center gap-1 shrink-0 overflow-x-auto no-scrollbar">
                {radiusPresets.map((p) => {
                  const isSelected = radiusMeters === p.meters;
                  return (
                    <button
                      key={p.meters}
                      type="button"
                      onClick={() => setRadiusMeters(p.meters)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 transition-all border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location & Address Row */}
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
            <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1 font-medium truncate">
                <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
              </div>

              {isGeocoding && (
                <div className="flex items-center gap-1 text-[9px] text-blue-600 shrink-0">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Mendeteksi...</span>
                </div>
              )}
            </div>

            <div>
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Nama jalan / mall / patokan alamat..."
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* 5. Fixed Pinned Bottom Action Bar (Always fully visible, never clipped) */}
        <div className="p-2.5 sm:px-4 sm:py-2.5 bg-slate-100/90 dark:bg-slate-850/90 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 z-20">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[45%]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
            <span className="truncate">{cityName ? `Kota: ${cityName}` : 'GPS Terkunci'}</span>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors text-center"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveLocation}
              className="flex-1 sm:flex-initial py-2 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/25 active:scale-95 text-center"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Titik Lokasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
