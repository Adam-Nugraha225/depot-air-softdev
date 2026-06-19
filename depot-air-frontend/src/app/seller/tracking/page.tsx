'use client';

import { useState, useEffect } from 'react';
import { orderAPI, fleetAPI } from '@/lib/api';
import { Truck, MapPin, Package, Loader2, Navigation, Clock, CheckCircle2, Circle, Phone } from 'lucide-react';

interface Fleet {
  id: string;
  truckId: string;
  driverName: string;
  status: string;
  lat?: number;
  lng?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  volume: number;
  totalPrice: number;
  status: string;
  buyer: { name: string };
  assignedFleet?: { truckId: string; driverName: string };
}

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
      setFleets(fleetsRes.data.data);
      setActiveOrders(ordersRes.data.data.filter((o: Order) => o.status === 'DIPROSES'));
    } catch { } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  // Fallback order matching PDF Page 13 details
  const activeOrder = activeOrders[0] || {
    orderNumber: 'AQ-8924',
    status: 'DIKIRIM',
    buyer: { name: 'Gudang Jakarta Pusat' },
    assignedFleet: {
      truckId: 'TRK-PAP-01',
      driverName: 'Ricky C.'
    }
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex rounded-2xl overflow-hidden border border-slate-150 bg-white shadow-sm animate-fade-in text-xs">
      
      {/* Left Sidebar Details */}
      <div className="w-full sm:w-80 border-r border-slate-150 flex flex-col flex-shrink-0 bg-white overflow-y-auto">
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PESANAN #{activeOrder.orderNumber}</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[8px]">Dalam Perjalanan</span>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Pengiriman Komersial</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Tujuan: {activeOrder.buyer?.name || 'Gudang Jakarta Pusat'}</p>
          </div>

          {/* Est. Tiba timing block */}
          <div className="bg-[#F4F9FD] border border-slate-100 rounded-xl p-3.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Est. Tiba</p>
              <h4 className="text-xl font-bold text-slate-800">14:30</h4>
              <p className="text-[9px] text-slate-450">Hari ini, 24 Okt</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-550">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

        {/* Stepper progress timeline */}
        <div className="flex-1 p-5 space-y-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Pengiriman</p>
          
          <div className="relative pl-1 space-y-0">
            {/* Stepper node 1 */}
            <div className="flex gap-3 relative pb-5">
              <div className="absolute top-4 left-3 w-0.5 h-full bg-primary-200" />
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-[10px] z-10 flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Pesanan Menunggu</p>
                <p className="text-[9px] text-slate-400 mt-0.5">08:15 WIB</p>
              </div>
            </div>

            {/* Stepper node 2 */}
            <div className="flex gap-3 relative pb-5">
              <div className="absolute top-4 left-3 w-0.5 h-full bg-primary-200" />
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-[10px] z-10 flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Pesanan Dikonfirmasi</p>
                <p className="text-[9px] text-slate-400 mt-0.5">08:30 WIB</p>
              </div>
            </div>

            {/* Stepper node 3 */}
            <div className="flex gap-3 relative pb-5">
              <div className="absolute top-4 left-3 w-0.5 h-full bg-primary-200" />
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-[10px] z-10 flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Disiapkan</p>
                <p className="text-[9px] text-slate-400 mt-0.5">10:45 WIB • Depot Alpha</p>
              </div>
            </div>

            {/* Stepper node 4 */}
            <div className="flex gap-3 relative pb-5">
              <div className="absolute top-4 left-3 w-0.5 h-full bg-slate-100" />
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-[10px] z-10 flex-shrink-0 animate-pulse-soft">
                ●
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Dalam Perjalanan</p>
                <p className="text-[9px] text-primary-600 font-semibold mt-0.5">Sedang dalam perjalanan</p>
              </div>
            </div>

            {/* Stepper node 5 */}
            <div className="flex gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px] z-10 flex-shrink-0">
                5
              </div>
              <div>
                <p className="font-bold text-slate-400 text-xs">Selesai</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Menunggu pengiriman tiba</p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver contact panel at bottom */}
        <div className="p-4 border-t border-slate-150 bg-slate-50/50">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Detail Pengemudi</p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-xs">
                {activeOrder.assignedFleet?.driverName?.split(' ').map(n => n[0]).join('') || 'RC'}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">{activeOrder.assignedFleet?.driverName || 'Ricky C.'}</h4>
                <p className="text-[10px] text-slate-500">Truk #{activeOrder.assignedFleet?.truckId || 'TRK-PAP-01'} • 5,000L</p>
              </div>
            </div>
            <button className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 hover:bg-emerald-100 transition-colors">
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Map Tracing panel */}
      <div className="flex-1 relative bg-slate-100">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/107.720,-6.920,13,0/1200x800?access_token=mock')" }}>
          <div className="w-full h-full bg-[#E5E9F0] opacity-95 relative">
            
            {/* Draw Path */}
            <svg className="absolute w-full h-full pointer-events-none">
              <path 
                d="M 150 380 Q 350 320 600 240 T 980 200" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="4" 
                strokeDasharray="8 6"
              />
            </svg>

            {/* Destination Point */}
            <div className="absolute top-[200px] left-[980px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold bg-white text-slate-850 px-2 py-0.5 rounded shadow-sm mt-1 border border-slate-100">Lokasi Pembeli</span>
            </div>

            {/* Driver Truck Pin */}
            <div className="absolute top-[280px] left-[460px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-pulse-soft">
              <div className="bg-primary-650 text-white p-2.5 rounded-full shadow-xl ring-4 ring-primary-100">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-primary-650 text-white px-2 py-0.5 rounded shadow-sm mt-1 border border-primary-600">Truk TRK-PAP-01</span>
            </div>

            {/* Overlay info bubble top-right matching PDF */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-100 max-w-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping flex-shrink-0" />
                <p className="text-[10px] font-bold text-slate-700 leading-snug">
                  Truk tiba dalam 5 km. Lalu lintas lancar. Melaju via Tol.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
