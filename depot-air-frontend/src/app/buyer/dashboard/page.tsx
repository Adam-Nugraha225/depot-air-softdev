'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { vendorAPI } from '@/lib/api';
import { Search, Star, MapPin, Droplets, X, Loader2, ShoppingCart } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  vendorProfile?: {
    rating: number;
    verificationStatus: string;
    specialty?: string | null;
    mainLocation?: string | null;
    pricePerLiter: number;
    defaultCapacity: number;
  } | null;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const getPrice = (vendor: Vendor) => vendor.vendorProfile?.pricePerLiter ?? 0;
const getCapacity = (vendor: Vendor) => vendor.vendorProfile?.defaultCapacity ?? 0;
const canOrder = (vendor: Vendor) => getPrice(vendor) > 0 && getCapacity(vendor) > 0;

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async (q?: string) => {
    try {
      setLoading(true);
      const res = await vendorAPI.getVendors(q);
      setVendors(res.data.data || []);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadVendors(search);
  };

  const handleOrder = () => {
    if (!selectedVendor || !canOrder(selectedVendor)) return;

    const price = getPrice(selectedVendor);
    const capacity = getCapacity(selectedVendor);
    const total = price * capacity;

    sessionStorage.setItem('selectedVendor', JSON.stringify({
      id: selectedVendor.id,
      name: selectedVendor.name,
      rating: selectedVendor.vendorProfile?.rating ?? 0,
      mainLocation: selectedVendor.vendorProfile?.mainLocation || 'Lokasi belum diisi',
      pricePerLiter: price,
      volume: capacity,
      totalPrice: total,
    }));
    window.location.href = '/buyer/payment';
  };

  const selectedPrice = selectedVendor ? getPrice(selectedVendor) : 0;
  const selectedCapacity = selectedVendor ? getCapacity(selectedVendor) : 0;
  const selectedReady = selectedVendor ? canOrder(selectedVendor) : false;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-primary-100 text-xs font-semibold mb-1">Selamat datang kembali</p>
          <h1 className="text-2xl font-bold mb-1">{user?.name || 'User'}</h1>
          <p className="text-slate-200 text-xs max-w-lg">Temukan vendor air bersih terpercaya di sekitar Anda dan pesan dengan mudah melalui Vendor-Hub.</p>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-800">Cari Vendor</h3>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="vendor-search"
              type="text"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-450 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-xs"
              placeholder="Masukkan lokasi atau nama vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0">
            <Search className="w-3.5 h-3.5" /> Cari Air
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16">
          <Droplets className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Tidak ada vendor ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vendors.map((vendor, i) => {
            const price = getPrice(vendor);
            const capacity = getCapacity(vendor);
            const ready = canOrder(vendor);

            return (
              <div key={vendor.id} className="card p-0 overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  <img src="/images/water_truck.png" alt={vendor.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{(vendor.vendorProfile?.rating ?? 0).toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-850 text-base mb-1.5">{vendor.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="truncate">{vendor.vendorProfile?.mainLocation || 'Lokasi belum diisi'}</span>
                  </div>

                  <div className="grid grid-cols-2 border border-slate-150 rounded-xl p-3 bg-slate-50/50 mb-4 text-xs">
                    <div className="border-r border-slate-150 pr-3">
                      <p className="text-slate-400 font-medium mb-0.5">Harga</p>
                      <p className="font-bold text-primary-600">{price > 0 ? `${formatRupiah(price)}/L` : 'Belum diatur'}</p>
                    </div>
                    <div className="pl-3">
                      <p className="text-slate-400 font-medium mb-0.5">Kapasitas</p>
                      <p className="font-bold text-slate-700">{capacity > 0 ? `${capacity.toLocaleString()} L` : 'Belum diatur'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!ready}
                    onClick={() => setSelectedVendor(vendor)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                      ready
                        ? 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> {ready ? 'Pesan Sekarang' : 'Profil Belum Lengkap'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedVendor && (
        <div className="modal-overlay" onClick={() => setSelectedVendor(null)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Buat Pesanan</h3>
              <button onClick={() => setSelectedVendor(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="border border-slate-150 rounded-2xl overflow-hidden mb-4 bg-white shadow-sm">
              <div className="h-32 bg-slate-100 relative">
                <img src="/images/water_truck.png" alt={selectedVendor.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold text-slate-700">{(selectedVendor.vendorProfile?.rating ?? 0).toFixed(1)}</span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-800 text-sm mb-1">{selectedVendor.name}</h4>
                <p className="text-xs text-slate-500 mb-2">{selectedVendor.vendorProfile?.mainLocation || 'Lokasi belum diisi'}</p>
                <p className="text-sm font-bold text-primary-600">{selectedPrice > 0 ? `${formatRupiah(selectedPrice)}/L` : 'Harga belum diatur'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl mb-6 border border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed">
                Anda akan memesan kapasitas default armada <strong className="text-slate-800">{selectedCapacity.toLocaleString()} liter</strong>. Estimasi total pembayaran adalah <strong className="text-primary-600">{formatRupiah(selectedPrice * selectedCapacity)}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOrder}
              disabled={!selectedReady}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              + Pesanan Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}