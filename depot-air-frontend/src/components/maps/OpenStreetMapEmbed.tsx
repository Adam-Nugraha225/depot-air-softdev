'use client';

import { useEffect, useRef, useState } from 'react';

interface MapProps {
  vendorLat?: number;
  vendorLng?: number;
  buyerLat?: number;
  buyerLng?: number;
  truckLat?: number;
  truckLng?: number;
  vendorLabel?: string;
  buyerLabel?: string;
  truckLabel?: string;
  zoom?: number;
  title?: string;
  className?: string;
}

// Known locations for geocoding fallback
const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'cibiru': { lat: -6.9299, lng: 107.7168 },
  'bandung timur': { lat: -6.9289, lng: 107.7138 },
  'bandung': { lat: -6.9175, lng: 107.6191 },
  'dago': { lat: -6.8633, lng: 107.6173 },
  'dago atas': { lat: -6.8533, lng: 107.6173 },
  'lembang': { lat: -6.8115, lng: 107.6194 },
  'soreang': { lat: -7.0309, lng: 107.5309 },
  'cikarang': { lat: -6.3055, lng: 107.1543 },
  'bekasi': { lat: -6.2383, lng: 106.9756 },
  'cileunyi': { lat: -6.9392, lng: 107.7553 },
  'jakarta': { lat: -6.2088, lng: 106.8456 },
  'jakarta pusat': { lat: -6.1862, lng: 106.8344 },
  'senayan': { lat: -6.2268, lng: 106.8022 },
  'kabupaten bandung': { lat: -7.0208, lng: 107.5881 },
  'kota bandung': { lat: -6.9175, lng: 107.6191 },
  'sumedang': { lat: -6.8561, lng: 107.9194 },
  'garut': { lat: -7.2175, lng: 107.9089 },
  'bogor': { lat: -6.5971, lng: 106.8060 },
  'depok': { lat: -6.4025, lng: 106.7942 },
  'tangerang': { lat: -6.1702, lng: 106.6403 },
};

function geocodeAddress(address: string): { lat: number; lng: number } | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (lower.includes(key)) {
      return coords;
    }
  }
  return null;
}

export default function OpenStreetMapEmbed({
  vendorLat,
  vendorLng,
  buyerLat,
  buyerLng,
  truckLat,
  truckLng,
  vendorLabel = 'Depot Vendor',
  buyerLabel = 'Lokasi Penerima',
  truckLabel = 'Armada',
  zoom = 13,
  title = 'Peta lokasi pengiriman',
  className = '',
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    } else {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Cleanup previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const hasVendor = vendorLat != null && vendorLng != null;
    const hasBuyer = buyerLat != null && buyerLng != null;
    const hasTruck = truckLat != null && truckLng != null;

    const defaultCenter: [number, number] = [-6.9175, 107.6191]; // Bandung
    let center: [number, number] = defaultCenter;
    if (hasVendor) center = [vendorLat!, vendorLng!];
    else if (hasTruck) center = [truckLat!, truckLng!];
    else if (hasBuyer) center = [buyerLat!, buyerLng!];

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const bounds: [number, number][] = [];

    // Custom icon factory
    const createIcon = (emoji: string, color: string) => {
      return L.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${color};border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
          font-size:16px;
        ">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });
    };

    // Vendor marker (store)
    if (hasVendor) {
      const pos: [number, number] = [vendorLat!, vendorLng!];
      bounds.push(pos);
      L.marker(pos, { icon: createIcon('🏪', '#2563eb') })
        .addTo(map)
        .bindPopup(`<div style="font-size:12px;font-weight:600;">${vendorLabel}</div><div style="font-size:10px;color:#666;">${vendorLat!.toFixed(5)}, ${vendorLng!.toFixed(5)}</div>`);
    }

    // Buyer marker (home)
    if (hasBuyer) {
      const pos: [number, number] = [buyerLat!, buyerLng!];
      bounds.push(pos);
      L.marker(pos, { icon: createIcon('🏠', '#10b981') })
        .addTo(map)
        .bindPopup(`<div style="font-size:12px;font-weight:600;">${buyerLabel}</div><div style="font-size:10px;color:#666;">${buyerLat!.toFixed(5)}, ${buyerLng!.toFixed(5)}</div>`);
    }

    // Truck marker (delivery)
    if (hasTruck) {
      const pos: [number, number] = [truckLat!, truckLng!];
      bounds.push(pos);
      L.marker(pos, { icon: createIcon('🚛', '#f59e0b') })
        .addTo(map)
        .bindPopup(`<div style="font-size:12px;font-weight:600;">${truckLabel}</div><div style="font-size:10px;color:#666;">${truckLat!.toFixed(5)}, ${truckLng!.toFixed(5)}</div>`);
    }

    // Draw route polyline from vendor to buyer
    if (hasVendor && hasBuyer) {
      const routePoints: [number, number][] = [[vendorLat!, vendorLng!]];
      
      // If truck exists and is between vendor and buyer, add it as a waypoint
      if (hasTruck) {
        routePoints.push([truckLat!, truckLng!]);
      }
      routePoints.push([buyerLat!, buyerLng!]);

      L.polyline(routePoints, {
        color: '#2563eb',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 8',
        lineCap: 'round',
      }).addTo(map);
    }

    // Fit bounds
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], zoom);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loaded, vendorLat, vendorLng, buyerLat, buyerLng, truckLat, truckLng, zoom, vendorLabel, buyerLabel, truckLabel]);

  return (
    <div
      ref={mapRef}
      title={title}
      className={`h-full w-full ${className}`}
      style={{ minHeight: '200px', background: '#f1f5f9' }}
    />
  );
}

export { geocodeAddress };
