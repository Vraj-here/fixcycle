import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, AlertTriangle } from 'lucide-react';
import { PUNE_CENTER } from '../data/problems';

/**
 * Live Tracking Map powered by Leaflet + OpenStreetMap centered on Pune, Maharashtra.
 * Displays customer pickup pin, repair shop destination, route polyline,
 * and smoothly animated pickup partner marker with ResizeObserver support.
 */
export default function TrackingMap({
  customerCoords,
  shopCoords,
  riderCoords,
  routePoints = [],
  shopName = 'Repair Shop',
  riderLabel = 'Pickup Partner',
  heightClass = 'h-[340px] sm:h-[440px]',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const staticLayerRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter = customerCoords || PUNE_CENTER;
    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    tileLayer.on('tileerror', () => setTileError(true));
    tileLayer.addTo(map);

    staticLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

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
      staticLayerRef.current = null;
      riderMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = staticLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (routePoints.length > 1) {
      L.polyline(routePoints, {
        color: '#2563EB',
        weight: 4,
        opacity: 0.75,
        dashArray: '8 8',
      }).addTo(layer);
    }

    if (customerCoords) {
      const custIcon = L.divIcon({
        className: 'fixcycle-marker',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="background:#16A34A;color:#FFFFFF;font-size:11px;font-weight:700;padding:4px 10px;border-radius:9999px;border:2px solid #FFFFFF;box-shadow:0 3px 10px rgba(22,163,74,0.35);white-space:nowrap;">
              Customer Pickup
            </div>
            <div style="width:10px;height:10px;background:#16A34A;border:2px solid #FFFFFF;border-radius:9999px;margin-top:3px;"></div>
          </div>
        `,
        iconSize: [120, 44],
        iconAnchor: [60, 40],
      });
      L.marker(customerCoords, { icon: custIcon }).addTo(layer);
    }

    if (shopCoords) {
      const shopIcon = L.divIcon({
        className: 'fixcycle-marker',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="background:#111827;color:#FFFFFF;font-size:11px;font-weight:700;padding:4px 10px;border-radius:9999px;border:2px solid #FFFFFF;box-shadow:0 3px 10px rgba(15,23,42,0.35);white-space:nowrap;max-width:170px;overflow:hidden;text-overflow:ellipsis;">
              ${shopName}
            </div>
            <div style="width:10px;height:10px;background:#111827;border:2px solid #FFFFFF;border-radius:9999px;margin-top:3px;"></div>
          </div>
        `,
        iconSize: [160, 44],
        iconAnchor: [80, 40],
      });
      L.marker(shopCoords, { icon: shopIcon }).addTo(layer);
    }

    if (customerCoords && shopCoords) {
      map.fitBounds([customerCoords, shopCoords], { padding: [55, 55] });
    }
  }, [customerCoords, shopCoords, routePoints, shopName]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !riderCoords) return;

    const riderIcon = L.divIcon({
      className: 'fixcycle-marker',
      html: `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
          <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
            <span class="rider-pulse" style="position:absolute;inset:0;border-radius:9999px;background:#2563EB;"></span>
            <span style="position:relative;width:22px;height:22px;border-radius:9999px;background:#2563EB;border:3px solid #FFFFFF;box-shadow:0 4px 12px rgba(37,99,235,0.5);display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-size:10px;font-weight:800;">
              FC
            </span>
          </div>
          <span style="margin-top:3px;background:#2563EB;color:#FFFFFF;font-size:10px;font-weight:600;padding:2px 7px;border-radius:9999px;white-space:nowrap;box-shadow:0 2px 6px rgba(37,99,235,0.35);">
            ${riderLabel}
          </span>
        </div>
      `,
      iconSize: [110, 48],
      iconAnchor: [55, 16],
    });

    if (!riderMarkerRef.current) {
      riderMarkerRef.current = L.marker(riderCoords, {
        icon: riderIcon,
        zIndexOffset: 900,
      }).addTo(map);
    } else {
      riderMarkerRef.current.setLatLng(riderCoords);
      riderMarkerRef.current.setIcon(riderIcon);
    }
  }, [riderCoords, riderLabel]);

  const handleRecenter = () => {
    const map = mapRef.current;
    if (!map) return;
    const pts = [customerCoords, shopCoords, riderCoords].filter(Boolean);
    if (pts.length >= 2) {
      map.fitBounds(pts, { padding: [55, 55] });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-card">
      <div ref={containerRef} className={`w-full ${heightClass}`} />

      <button
        type="button"
        onClick={handleRecenter}
        className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-md hover:bg-slate-50"
      >
        <Crosshair className="w-3.5 h-3.5 text-blue-600" />
        Fit Route
      </button>

      <div className="absolute bottom-3 left-3 z-20 rounded-xl bg-white/95 backdrop-blur border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm">
        Pune, Maharashtra · Simulated Route Tracking
      </div>

      {tileError && (
        <div className="absolute top-3 left-14 right-28 z-20 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Map tiles unavailable offline; simulated marker &amp; route coordinates remain active.</span>
        </div>
      )}
    </div>
  );
}
