'use client';

import { useState, useEffect } from 'react';
import { orderAPI, fleetAPI } from '@/lib/api';
import { Truck, MapPin, Package, Loader2, Clock, CheckCircle2, Phone, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import OpenStreetMapEmbed, { geocodeAddress } from '@/components/maps/OpenStreetMapEmbed';

interface Fleet {
  id: string;
  truckId: string;
  driverName: string;
  status: string;
  lat?: number | null;
  lng?: number | null;
}

interface Order {
  id: string;
  orderNumber: string;
  volume: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  address?: string | null;
  vendor?: {
    name: string;
    vendorProfile?: {
      mainLocation?: string | null;
    } | null;
  } | null;
  buyer: { name: string; phone?: string | null };
  assignedFleet?: {
    truckId: string;
    driverName: string;
    status?: string;
    capacity?: number | null;
    lat?: number | null;
    lng?: number | null;
  } | null;
}

const DEFAULT_MAP_CENTER = {
  lat: -6.9147,
  lng: 107.6098,
};

const statusSteps = [
  { key: 'MENUNGGU_KONFIRMASI', label: 'Pesanan Menunggu' },
  { key: 'DIKONFIRMASI', label: 'Pesanan Dikonfirmasi' },
  { key: 'DISIAPKAN', label: 'Disiapkan' },
  { key: 'DALAM_PERJALANAN', label: 'Dalam Perjalanan' },
  { key: 'SELESAI', label: 'Selesai' },
];

const getStepIndex = (status: string) => {
  if (status === 'MENUNGGU_KONFIRMASI') return 0;
  if (status === 'DIKONFIRMASI') return 1;
  if (status === 'DISIAPKAN') return 2;
  if (status === 'DALAM_PERJALANAN') return 3;
  if (status === 'SELESAI') return 4;
  return 0;
};

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function SellerTracking() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fleetsRes, ordersRes] = await Promise.all([
        fleetAPI.getFleets(),
        orderAPI.getOrders()
      ]);
      setFleets(fleetsRes.data.data || []);
      setActiveOrders((ordersRes.data.data || []).filter((order: Order) =>
        ['DIKONFIRMASI', 'DISIAPKAN', 'DALAM_PERJALANAN'].includes(order.status)
      ));
    } catch {
      setFleets([]);
      setActiveOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  const activeOrder = activeOrders[0];

  if (!activeOrder) {
    return (
      <div className="space-y-6 animate-fade-in text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Pelacakan Pengiriman</h1>
            <p className="text-xs text-slate-500 mt-0.5">Pantau pesanan yang sudah dikonfirmasi atau sedang berjalan.</p>
          </div>
          <Link href="/seller/orders" className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5 self-start">
            <Package className="w-4 h-4" /> Lihat Pesanan
          </Link>
        </div>

        <div className="card p-12 text-center">
          <Truck className="w-14 h-14 text-slate-250 mx-auto mb-4" />
          <h2 className="text-base font-bold text-slate-800 mb-2">Belum Ada Pengiriman Aktif</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Setelah pesanan dikonfirmasi dan armada ditugaskan, lokasi pengiriman akan tampil di peta ini.
          </p>
        </div>
      </div>
    );
  }

  const stepIndex = getStepIndex(activeOrder.status);
  const assignedFleet = activeOrder.assignedFleet;
  const hasFleetLocation = typeof assignedFleet?.lat === 'number' && typeof assignedFleet?.lng === 'number';
  const locatedFleet = fleets.find(fleet => fleet.truckId === assignedFleet?.truckId);

  // Resolve map coordinates
  const vendorCoords = geocodeAddress(activeOrder.vendor?.vendorProfile?.mainLocation || '') || geocodeAddress('Dago Atas') || { lat: -6.8533, lng: 107.6173 };
  const buyerCoords = geocodeAddress(activeOrder.address || '') || geocodeAddress('Kabupaten Bandung') || { lat: -7.0208, lng: 107.5881 };

  let truckLat: number | undefined = undefined;
  let truckLng: number | undefined = undefined;
  
  if (hasFleetLocation) {
    truckLat = assignedFleet!.lat!;
    truckLng = assignedFleet!.lng!;
  } else if (locatedFleet?.lat != null && locatedFleet?.lng != null) {
    truckLat = locatedFleet.lat;
    truckLng = locatedFleet.lng;
  } else if (activeOrder.status === 'DALAM_PERJALANAN') {
    // Simulated truck location halfway if currently delivering
    truckLat = (vendorCoords.lat + buyerCoords.lat) / 2;
    truckLng = (vendorCoords.lng + buyerCoords.lng) / 2;
  }

  const mapLat = truckLat ?? DEFAULT_MAP_CENTER.lat;
  const mapLng = truckLng ?? DEFAULT_MAP_CENTER.lng;
  const driverName = assignedFleet?.driverName || 'Belum ditugaskan';
  const truckId = assignedFleet?.truckId || 'Armada belum dipilih';
  const capacityText = assignedFleet?.capacity ? `${assignedFleet.capacity.toLocaleString()} L` : 'Kapasitas belum diisi';

  return (
    <div className="h-[calc(100vh-7.5rem)] flex rounded-2xl overflow-hidden border border-slate-150 bg-white shadow-sm animate-fade-in text-xs">
      <div className="w-full sm:w-80 border-r border-slate-150 flex flex-col flex-shrink-0 bg-white overflow-y-auto">
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">PESANAN {activeOrder.orderNumber}</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[8px] whitespace-nowrap">{activeOrder.status.replace(/_/g, ' ')}</span>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 text-sm">Pengiriman Air Bersih</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Tujuan: {activeOrder.buyer?.name || 'Pembeli'}</p>
          </div>

          <div className="bg-[#F4F9FD] border border-slate-100 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Dibuat</p>
              <h4 className="text-sm font-bold text-slate-800">{formatDateTime(activeOrder.createdAt)}</h4>
              <p className="text-[9px] text-slate-450">Estimasi tiba belum tersedia</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-550 flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Pengiriman</p>

          <div className="relative pl-1 space-y-0">
            {statusSteps.map((step, index) => {
              const isActive = index <= stepIndex;
              const isCurrent = index === stepIndex;
              return (
                <div key={step.key} className="flex gap-3 relative pb-5 last:pb-0">
                  {index < statusSteps.length - 1 && (
                    <div className={`absolute top-4 left-3 w-0.5 h-full ${index < stepIndex ? 'bg-primary-200' : 'bg-slate-100'}`} />
                  )}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-10 flex-shrink-0 ${
                    isCurrent ? 'bg-primary-500 text-white animate-pulse-soft' : isActive ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
                  </div>
                  <div>
                    <p className={`font-bold text-xs ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{isCurrent ? 'Status saat ini' : isActive ? 'Sudah dilewati' : 'Menunggu'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-150 bg-slate-50/50">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Detail Pengemudi</p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {driverName.split(' ').map(name => name[0]).slice(0, 2).join('') || 'NA'}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-xs truncate">{driverName}</h4>
                <p className="text-[10px] text-slate-500 truncate">{truckId} - {capacityText}</p>
              </div>
            </div>
            {activeOrder.buyer?.phone ? (
              <a href={`tel:${activeOrder.buyer.phone}`} className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 hover:bg-emerald-100 transition-colors flex-shrink-0">
                <Phone className="w-4 h-4" />
              </a>
            ) : (
              <button type="button" disabled className="p-2.5 bg-slate-100 rounded-xl text-slate-400 cursor-not-allowed flex-shrink-0">
                <Phone className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden sm:block flex-1 relative bg-slate-100">
        <OpenStreetMapEmbed
          vendorLat={vendorCoords.lat}
          vendorLng={vendorCoords.lng}
          buyerLat={buyerCoords.lat}
          buyerLng={buyerCoords.lng}
          truckLat={truckLat}
          truckLng={truckLng}
          vendorLabel={activeOrder.vendor?.name || 'Depot Anda'}
          buyerLabel={activeOrder.buyer?.name || 'Lokasi Pembeli'}
          truckLabel={driverName ? `Armada - ${driverName}` : 'Armada'}
          zoom={hasFleetLocation || locatedFleet ? 14 : 12}
          title={`Peta pengiriman ${activeOrder.orderNumber}`}
        />

        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-100 max-w-xs">
          <div className="flex items-center gap-2">
            {hasFleetLocation || locatedFleet || (activeOrder.status === 'DALAM_PERJALANAN') ? (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
            <p className="text-[10px] font-bold text-slate-700 leading-snug">
              {hasFleetLocation || locatedFleet
                ? `Lokasi ${truckId}: ${mapLat.toFixed(5)}, ${mapLng.toFixed(5)}`
                : activeOrder.status === 'DALAM_PERJALANAN'
                  ? 'Simulasi rute perjalanan armada.'
                  : 'Koordinat armada belum dikirim oleh backend.'}
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-100 max-w-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-800">{truckId}</p>
              <p className="text-[9px] text-slate-500">Pengemudi: {driverName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}