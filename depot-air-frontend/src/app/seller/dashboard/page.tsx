'use client';

import { useState, useEffect } from 'react';
import { analyticsAPI, orderAPI, fleetAPI, userAPI } from '@/lib/api';
import { DollarSign, TrendingUp, Truck, Star, ShieldCheck, Package, Loader2, CheckCircle2, AlertTriangle, ArrowUpRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import OpenStreetMapEmbed from '@/components/maps/OpenStreetMapEmbed';

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
  capacity?: number;
  lat?: number;
  lng?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  volume: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  buyer: { name: string };
  waterType?: string;
  deliverySchedule?: string;
}

interface VendorProfile {
  verificationStatus?: string;
  profileCompletion?: number;
  specialty?: string | null;
  mainLocation?: string | null;
}

const DEFAULT_MAP_CENTER = {
  lat: -6.9147,
  lng: 107.6098,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function SellerDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PESANAN' | 'ARMADA' | 'WAWASAN'>('PESANAN');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [analyticsRes, fleetsRes, ordersRes, profileRes] = await Promise.all([
        analyticsAPI.getDashboardAnalytics(),
        fleetAPI.getFleets(),
        orderAPI.getOrders({ status: 'MENUNGGU_KONFIRMASI' }),
        userAPI.getProfile(),
      ]);
      setAnalytics(analyticsRes.data.data);
      setFleets(fleetsRes.data.data || []);
      setPendingOrders(ordersRes.data.data || []);
      setProfile(profileRes.data.data?.vendorProfile || null);
    } catch {
      setAnalytics({ totalRevenue: 0, successfulDeliveries: 0, rating: 0 });
      setFleets([]);
      setPendingOrders([]);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fleetStatusColor = (status: string) => {
    switch (status) {
      case 'TERSEDIA': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'SEDANG_BERTUGAS': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PEMELIHARAAN': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const verificationStatus = profile?.verificationStatus || 'PENDING';
  const profileCompletion = profile?.profileCompletion ?? 0;
  const locatedFleet = fleets.find(fleet => typeof fleet.lat === 'number' && typeof fleet.lng === 'number');
  const mapLat = locatedFleet?.lat ?? DEFAULT_MAP_CENTER.lat;
  const mapLng = locatedFleet?.lng ?? DEFAULT_MAP_CENTER.lng;

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${verificationStatus === 'VERIFIED' ? 'bg-[#EBFDF7] border-[#C5F3E4]' : 'bg-[#FFF8EA] border-[#FBEAC9]'} border rounded-2xl p-5 flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3.5">
            <div className={`${verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
              {verificationStatus === 'VERIFIED' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h4 className={`${verificationStatus === 'VERIFIED' ? 'text-emerald-800' : 'text-amber-800'} font-bold text-sm`}>
                Verifikasi {verificationStatus === 'VERIFIED' ? 'Disetujui' : 'Tertunda'}
              </h4>
              <p className={`${verificationStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'} mt-0.5 text-[11px]`}>
                {verificationStatus === 'VERIFIED' ? 'Akun vendor sudah terverifikasi.' : 'Lengkapi data vendor agar bisa dipercaya pembeli.'}
              </p>
            </div>
          </div>
          <Link href="/seller/settings" className={`${verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'} px-3 py-2 font-bold rounded-xl flex-shrink-0 text-xs transition-all`}>
            Kelola
          </Link>
        </div>

        <div className={`${profileCompletion >= 100 ? 'bg-[#EBFDF7] border-[#C5F3E4]' : 'bg-white border-slate-150'} border rounded-2xl p-5 flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3.5">
            <div className={`${profileCompletion >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-primary-100 text-primary-600'} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Profil Vendor: {profileCompletion}%</h4>
              <p className="text-slate-500 mt-0.5 text-[11px]">
                {profileCompletion >= 100 ? 'Profil Anda siap dilihat pembeli.' : 'Tambahkan lokasi, spesialisasi, harga, dan kapasitas.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl flex-shrink-0 text-xs">
            {profileCompletion >= 100 ? 'LENGKAP' : 'BELUM'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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

          {activeTab === 'PESANAN' && (
            <div className="space-y-3.5">
              <h3 className="font-bold text-slate-800 text-sm">Pesanan Masuk Baru</h3>
              {pendingOrders.length === 0 ? (
                <div className="card p-8 text-center">
                  <Package className="w-10 h-10 text-slate-250 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 text-sm">Belum Ada Pesanan Baru</h4>
                  <p className="text-slate-400 mt-1">Pesanan baru dari pembeli akan tampil di sini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map(order => (
                    <div key={order.id} className="card p-4 flex items-center justify-between gap-4 border border-slate-100 hover:border-slate-200 transition-all">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800 text-xs">{order.orderNumber}</span>
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold rounded text-[8px] tracking-wider">BARU</span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5 truncate">{order.buyer?.name || 'Pembeli'} - {order.volume.toLocaleString()} Liter</p>
                          <p className="text-[10px] text-slate-400 mt-1">Dibuat {formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <Link href="/seller/orders" className="text-primary-650 hover:underline font-bold text-xs flex-shrink-0">Detail</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ARMADA' && (
            <div className="space-y-3.5">
              <h3 className="font-bold text-slate-800 text-sm">Armada Terdaftar</h3>
              {fleets.length === 0 ? (
                <div className="card p-8 text-center">
                  <Truck className="w-10 h-10 text-slate-250 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-700 text-sm">Belum Ada Armada</h4>
                  <p className="text-slate-400 mt-1">Tambahkan kendaraan agar bisa menugaskan pengiriman.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fleets.map(fleet => (
                    <div key={fleet.id} className="card p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Truck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">{fleet.truckId}</p>
                          <p className="text-[10px] text-slate-500 truncate">Pengemudi: {fleet.driverName || '-'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 font-bold rounded text-[9px] border ${fleetStatusColor(fleet.status)}`}>{fleet.status.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'WAWASAN' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-5">
                <DollarSign className="w-5 h-5 text-primary-500 mb-3" />
                <p className="text-[10px] text-slate-400 uppercase font-bold">Pendapatan</p>
                <h4 className="text-base font-bold text-slate-850 mt-1">{formatCurrency(analytics?.totalRevenue || 0)}</h4>
              </div>
              <div className="card p-5">
                <Truck className="w-5 h-5 text-emerald-500 mb-3" />
                <p className="text-[10px] text-slate-400 uppercase font-bold">Pengiriman Selesai</p>
                <h4 className="text-base font-bold text-slate-850 mt-1">{analytics?.successfulDeliveries || 0}</h4>
              </div>
              <div className="card p-5">
                <Star className="w-5 h-5 text-amber-400 mb-3 fill-amber-400" />
                <p className="text-[10px] text-slate-400 uppercase font-bold">Rating</p>
                <h4 className="text-base font-bold text-slate-850 mt-1">{(analytics?.rating || 0).toFixed(1)}</h4>
              </div>
            </div>
          )}

          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Armada & Operasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrasi Truk</p>
                {fleets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-slate-400">
                    Belum ada armada terdaftar.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {fleets.slice(0, 3).map(fleet => (
                      <div key={fleet.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100/50 gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Truck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate">{fleet.truckId}</p>
                            <p className="text-[10px] text-slate-500 truncate">Pengemudi: {fleet.driverName || '-'}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 font-bold rounded text-[9px] border flex-shrink-0 ${fleetStatusColor(fleet.status)}`}>{fleet.status.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-150 h-44 bg-slate-100">
                <OpenStreetMapEmbed
                  centerLat={mapLat}
                  centerLng={mapLng}
                  zoom={locatedFleet ? 14 : 12}
                  title="Peta armada seller"
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-1 bg-white/95 backdrop-blur-sm rounded border border-slate-100 flex items-center gap-1 shadow-sm">
                  <span className={`${locatedFleet ? 'bg-blue-500' : 'bg-slate-300'} w-1.5 h-1.5 rounded-full animate-pulse`} />
                  <span className="text-[8px] font-bold text-slate-500">{locatedFleet ? 'GPS Armada Langsung' : 'Belum Ada Koordinat'}</span>
                </div>
                {locatedFleet && (
                  <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-2 shadow-sm border border-slate-100 max-w-[80%]">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-primary-600" />
                      <span className="truncate">{locatedFleet.truckId} - {locatedFleet.driverName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Ulasan Pembeli</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xl font-bold text-slate-850">{(analytics?.rating || 0).toFixed(1)}</span>
                <div className="flex text-amber-400">
                  {[0, 1, 2, 3, 4].map(index => (
                    <Star key={index} className={`w-3.5 h-3.5 ${index < Math.round(analytics?.rating || 0) ? 'fill-current' : 'opacity-30'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 text-center text-slate-400">
              <Star className="w-8 h-8 mx-auto mb-2 text-slate-250" />
              <p className="font-semibold">Belum ada ulasan tertulis.</p>
              <p className="text-[10px] mt-1">Ulasan dari pembeli akan tampil setelah transaksi selesai.</p>
            </div>
          </div>

          <div className="card p-5 bg-[#0b1329] text-white space-y-4">
            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Cuplikan Analitik</h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400">Pendapatan Selesai</p>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-bold">{formatCurrency(analytics?.totalRevenue || 0)}</h2>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> Aktual
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-slate-800 pt-3.5">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Pengiriman Berhasil</span>
                  <span className="font-bold text-white">{analytics?.successfulDeliveries || 0} selesai</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: analytics?.successfulDeliveries ? '100%' : '0%' }} />
                </div>
              </div>

              <Link href="/seller/orders" className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-300 hover:text-primary-200">
                Lihat pesanan <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}