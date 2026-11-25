import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, AlertTriangle } from 'lucide-react';
import { PUNE_CENTER } from '../data/problems';

/**
 * Interactive Leaflet + OpenStreetMap viewer centered on Pune, Maharashtra.
 * Uses 100% free OpenStreetMap tiles (no API key required).
 * Includes ResizeObserver invalidateSize() fix for mobile tab toggles and screen rotation.
 */
export default function MapView({
  customerCoords,
  shops = [],
  selectedShopId,
  onSelectShop,
  heightClass = 'h-[360px] sm:h-[480px] lg:h-[580px]',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [tileError, setTileError] = useState(false);

  // Initialize Leaflet map centered on Pune, Maharashtra
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: customerCoords || PUNE_CENTER,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    tileLayer.on('tileerror', () => {
      setTileError(true);
    });

    tileLayer.addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Fix grey/blank tiles when switching mobile Map/List tabs or rotating phone
    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update markers whenever customerCoords, shops, or selectedShopId change
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Customer approximate pickup zone (privacy-first radius circle + pin)
    if (customerCoords) {
      L.circle(customerCoords, {
        radius: 450,
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(layer);

      const userIcon = L.divIcon({
        className: 'fixcycle-marker',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:18px;height:18px;border-radius:9999px;background:#2563EB;border:3px solid #FFFFFF;box-shadow:0 2px 8px rgba(37,99,235,0.45);"></div>
            <div style="margin-top:4px;background:#111827;color:#FFFFFF;font-size:10px;font-weight:600;padding:2px 7px;border-radius:9999px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);">Your Area</div>
          </div>
        `,
        iconSize: [70, 40],
        iconAnchor: [35, 10],
      });

      L.marker(customerCoords, { icon: userIcon }).addTo(layer);
    }

    // 2. Pune repair shop markers
    shops.forEach((shop) => {
      const isSelected = shop.id === selectedShopId;
      const bgColor = isSelected
        ? '#2563EB'
        : shop.isAuthorized
        ? '#0F172A'
        : '#FFFFFF';
      const textColor = isSelected || shop.isAuthorized ? '#FFFFFF' : '#111827';
      const borderColor = isSelected ? '#1D4ED8' : shop.isAuthorized ? '#0F172A' : '#CBD5E1';

      const shopIcon = L.divIcon({
        className: 'fixcycle-marker',
        html: `
          <div style="
            display:inline-flex;align-items:center;gap:5px;
            background:${bgColor};color:${textColor};
            border:2px solid ${borderColor};
            padding:5px 10px;border-radius:9999px;
            font-size:11px;font-weight:700;
            box-shadow:0 4px 12px rgba(15,23,42,0.16);
            white-space:nowrap;transform:${isSelected ? 'scale(1.08)' : 'scale(1)'};
            transition:transform 0.15s ease;
          ">
            <span style="color:#F59E0B;">★</span>
            <span>${shop.rating.toFixed(1)}</span>
            <span style="max-width:110px;overflow:hidden;text-overflow:ellipsis;font-weight:600;">${shop.name.split(' ')[0]}</span>
          </div>
        `,
        iconSize: [140, 32],
        iconAnchor: [70, 16],
      });

      const marker = L.marker(shop.coords, {
        icon: shopIcon,
        zIndexOffset: isSelected ? 500 : 100,
      }).addTo(layer);

      marker.on('click', () => {
        if (onSelectShop) onSelectShop(shop);
      });
    });
  }, [customerCoords, shops, selectedShopId, onSelectShop]);

  // Smoothly pan when customer switches Pune neighborhood
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !customerCoords || selectedShopId) return;
    map.flyTo(customerCoords, 12, { duration: 0.55 });
  }, [customerCoords]);

  // Smoothly pan to selected shop when clicked
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedShopId) return;
    const selected = shops.find((s) => s.id === selectedShopId);
    if (selected) {
      map.flyTo(selected.coords, 14, { duration: 0.6 });
    }
  }, [selectedShopId, shops]);

  const handleRecenter = () => {
    const map = mapRef.current;
    if (!map) return;
    const coordsList = [
      ...(customerCoords ? [customerCoords] : []),
      ...shops.map((s) => s.coords),
    ];
    if (coordsList.length > 1) {
      map.fitBounds(coordsList, { padding: [45, 45] });
    } else {
      map.setView(customerCoords || PUNE_CENTER, 12);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-card">
      <div ref={containerRef} className={`w-full ${heightClass}`} />

      {/* Recenter Map Control */}
      <button
        type="button"
        onClick={handleRecenter}
        className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-slate-50 transition-colors"
        title="Recenter map to show all Pune shops"
      >
        <Crosshair className="w-3.5 h-3.5 text-blue-600" />
        Recenter Pune
      </button>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-20 rounded-xl bg-white/95 backdrop-blur border border-slate-200 px-3 py-2 text-[11px] text-slate-600 shadow-sm flex flex-wrap items-center gap-3">
        <span className="font-semibold text-slate-800">Pune, MH</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          Your Area
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
          Authorized
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white border border-slate-400" />
          Independent
        </span>
      </div>

      {/* Offline / Tile load fallback */}
      {tileError && (
        <div className="absolute top-3 left-14 right-32 z-20 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Map tiles could not load offline. Shop pins and list view still work.</span>
        </div>
      )}
    </div>
  );
}
