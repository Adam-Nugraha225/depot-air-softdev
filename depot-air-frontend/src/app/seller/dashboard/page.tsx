'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { analyticsAPI, orderAPI, fleetAPI } from '@/lib/api';
import { DollarSign, TrendingUp, Truck, Star, ShieldCheck, Package, Loader2, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, MessageSquareCode } from 'lucide-react';
import Link from 'next/link';

interface Analytics {
  totalRevenue: number;
  successfulDeliveries: number;
  rating: number;
}

interface Fleet {
  id: string;
  truckId: string;
  driverName: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  volume: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  buyer: { name: string };
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PESANAN' | 'ARMADA' | 'WAWASAN'>('PESANAN');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsRes, fleetsRes, ordersRes] = await Promise.all([
        analyticsAPI.getDashboardAnalytics(),
        fleetAPI.getFleets(),
        orderAPI.getOrders({ status: 'MENUNGGU_KONFIRMASI' })
      ]);
      setAnalytics(analyticsRes.data.data);
      setFleets(fleetsRes.data.data);
      setPendingOrders(ordersRes.data.data);
    } catch { } finally {
      setLoading(false);
    }
  };

  const fleetStatusColor = (status: string) => {
    switch (status) {
      case 'TERSEDIA': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'SEDANG_BERTUGAS': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PEMELIHARAAN': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Top Banner Split Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Yellow Pending Warning Banner */}
        <div className="bg-[#FFF8EA] border border-[#FBEAC9] rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-800 text-sm">Verifikasi Tertunda</h4>
              <p className="text-amber-600 mt-0.5 text-[11px]">Perbarui dokumen asuransi sebelum akhir hari.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition-all flex-shrink-0 text-xs">
            Kelola Dokumen
          </button>
        </div>

        {/* Green Profile Completed Banner */}
        <div className="bg-[#EBFDF7] border border-[#C5F3E4] rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-800 text-sm">Profil Vendor Lengkap: 100%</h4>
              <p className="text-emerald-600 mt-0.5 text-[11px]">Profil Anda dapat dilihat oleh semua pembeli.</p>
            </div>
          </div>
          <span className="px-3 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl flex-shrink-0 text-xs">
            MAKS
          </span>
        </div>
      </div>

      {/* Main Grid Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panels: orders, operations & map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Tabs Selector */}
          <div className="flex border-b border-slate-150 gap-6">
            {(['PESANAN', 'ARMADA', 'WAWASAN'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-bold text-xs relative transition-all ${
                  activeTab === tab 
                    ? 'text-slate-800 border-b-2 border-primary-500' 
                    : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                {tab === 'PESANAN' ? 'Pesanan Masuk' : tab === 'ARMADA' ? 'Armada Aktif' : 'Wawasan'}
              </button>
            ))}
          </div>

          {/* Tab Content: Pesanan Masuk */}
          {activeTab === 'PESANAN' && (
            <div className="space-y-3.5">
              <h3 className="font-bold text-slate-800 text-sm">Pesanan Masuk Baru</h3>
              <div className="space-y-3">
                {/* Order card 1 */}
                <div className="card p-4 flex items-center justify-between gap-4 border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">#ORD-9921</span>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold rounded text-[8px] tracking-wider">BARU</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">Lagos City Marina • 15.000 Liter</p>
                      <p className="text-[10px] text-slate-400 mt-1">Batas waktu dalam 2j 45m</p>
                    </div>
                  </div>
                  <Link href="/seller/orders" className="text-primary-650 hover:underline font-bold text-xs">Detail →</Link>
                </div>

                {/* Order card 2 */}
                <div className="card p-4 flex items-center justify-between gap-4 border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">#ORD-9890</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-555 font-bold rounded text-[8px] tracking-wider">STANDAR</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">Victoria Island Hub • 10.000 Liter</p>
                      <p className="text-[10px] text-slate-400 mt-1">Batas waktu dalam 5j 20m</p>
                    </div>
                  </div>
                  <Link href="/seller/orders" className="text-primary-650 hover:underline font-bold text-xs">Detail →</Link>
                </div>
              </div>
            </div>
          )}

          {/* Operations and GPS Tracking map grid */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Armada & Operasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Fleet listings */}
              <div className="space-y-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrasi Truk</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs">TRK-LAG-01</p>
                        <p className="text-[10px] text-slate-500">Pengemudi: John Doe</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[9px]">Aktif</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs">TRK-LAG-05</p>
                        <p className="text-[10px] text-slate-500">Pengemudi: Mike Ross</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[9px]">Sedang Jalan</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs">TRK-LAG-09</p>
                        <p className="text-[10px] text-slate-500">Pengemudi: Harvey Specter</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-150 text-slate-600 font-bold rounded text-[9px]">Siaga</span>
                  </div>
                </div>
              </div>

              {/* Dark Ops Tracking GPS visual matching PDF */}
              <div className="relative rounded-xl overflow-hidden border border-slate-150 h-44 bg-[#1E293B]">
                <div className="absolute inset-0 bg-[#0F172A] opacity-90 flex flex-col items-center justify-center text-center p-4">
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-800/80 backdrop-blur-sm rounded border border-slate-700/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-slate-400">GPS Armada Langsung</span>
                  </div>

                  {/* Dark map tracers placeholder details */}
                  <div className="w-full h-full relative">
                    {/* Tracing paths */}
                    <svg className="absolute w-full h-full pointer-events-none">
                      <path d="M 50 120 Q 120 70 200 90" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
                    </svg>
                    
                    {/* Pins */}
                    <div className="absolute top-[120px] left-[50px] w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white animate-pulse" />
                    <div className="absolute top-[70px] left-[130px] w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white animate-pulse" />
                    <div className="absolute top-[90px] left-[200px] w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Panel: Client reviews & Analytics */}
        <div className="space-y-6">
          {/* Client reviews card */}
          <div className="card p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Ulasan Pembeli</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xl font-bold text-slate-850">4.5</span>
                <div className="flex text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current opacity-30" />
                </div>
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[8px]">98% Puas</span>
              </div>
            </div>

            {/* Review feeds */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">AquaResort Lagos</h4>
                  <span className="text-[10px] text-slate-400">Kemarin</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  "Pengiriman tepat waktu dan pengemudi profesional. Laporan kemurnian air dilampirkan sesuai permintaan."
                </p>
                <div className="text-right">
                  <button className="text-[10px] font-bold text-primary-650 hover:underline flex items-center gap-1 ml-auto">
                    <MessageSquareCode className="w-3 h-3" /> Balas
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">Zenith Estates</h4>
                  <span className="text-[10px] text-slate-400">3 hari lalu</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  "Pesanan tiba 10 menit terlambat tetapi komunikasi sangat baik. Layanan dapat diandalkan."
                </p>
                <div className="text-right">
                  <button className="text-[10px] font-bold text-primary-650 hover:underline flex items-center gap-1 ml-auto">
                    <MessageSquareCode className="w-3 h-3" /> Balas
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cuplikan Analitik Card */}
          <div className="card p-5 bg-[#0b1329] text-white space-y-4">
            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Cuplikan Analitik</h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400">Pendapatan (Bulan ini)</p>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-bold">4.2M</h2>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    ▲ +12%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800 pt-3.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Pengiriman Berhasil</span>
                  <span className="font-bold text-white">142 / 150 Target</span>
                </div>
                {/* Completion Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
