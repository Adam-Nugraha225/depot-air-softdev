'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { orderAPI } from '@/lib/api';
import { Package, CheckCircle2, XCircle, Loader2, Clock, User, Droplets, MapPin, Bell, Calendar, HelpCircle } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  volume: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  buyer: { name: string; phone?: string };
  assignedFleet?: { truckId: string; driverName: string };
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');
  const { showToast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      setOrders(res.data.data);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setProcessingId(orderId);
    try {
      await orderAPI.updateOrderStatus(orderId, status);
      await loadOrders();
      const statusMsg = status === 'DIPROSES' ? 'Pesanan berhasil dikonfirmasi!' :
                        status === 'DIBATALKAN' ? 'Pesanan berhasil ditolak.' :
                        status === 'SELESAI' ? 'Pengiriman berhasil diselesaikan!' : 'Status pesanan diperbarui.';
      const toastType = status === 'DIBATALKAN' ? 'warning' : 'success';
      showToast(statusMsg, toastType as any);
    } catch {
      showToast('Gagal memperbarui status pesanan. Coba lagi.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  // Count active pending orders to display in the header action badge
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pesanan Masuk</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tinjau dan proses permintaan pengiriman air yang baru.</p>
        </div>
        
        {/* Action badge on top right */}
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-900 text-white font-bold text-xs shadow-sm self-start">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>{pendingCount} Tindakan Diperlukan</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'ALL', label: 'Semua', count: orders.length },
          { key: 'PENDING', label: 'Menunggu', count: orders.filter(o => o.status === 'PENDING').length },
          { key: 'DIPROSES', label: 'Diproses', count: orders.filter(o => o.status === 'DIPROSES').length },
          { key: 'SELESAI', label: 'Selesai', count: orders.filter(o => o.status === 'SELESAI').length },
          { key: 'DIBATALKAN', label: 'Dibatalkan', count: orders.filter(o => o.status === 'DIBATALKAN').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders Grid Matching PDF Cards */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 text-slate-250 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-600 mb-2">Tidak Ada Pesanan</h3>
          <p className="text-slate-400">Pesanan dengan status ini belum tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.map((order, i) => {
            // Mock dynamic details matching PDF Page 11 cards
            const timeLimit = i === 0 ? '14m tersisa' : i === 1 ? '1j 45m tersisa' : '1j 52m tersisa';
            const limitColor = i === 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-100 text-slate-550 border-slate-150';
            
            const schedule = i === 0 ? 'Hari ini, 14:00 - 16:00' : 'Besok, 08:00 - 10:00';
            const label = i === 0 ? 'Pengiriman Standar' : i === 1 ? 'Pengisian Terjadwal' : 'Pengiriman Massal';
            
            const destination = i === 0 ? 'Industrial Park, Site B, 124 Logistics Way' : 
                                i === 1 ? 'Metro Construction Site, Downtown Dev Area' : 
                                'Agri-Corp Reservoir 2, Route 9, Rural District';

            return (
              <div key={order.id} className="card p-5 animate-slide-up space-y-4 flex flex-col justify-between" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Header id & limits */}
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-slate-800 text-xs">{order.orderNumber || `ORD-2023-884${i+1}`}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${limitColor} flex items-center gap-1`}>
                    <Clock className="w-2.5 h-2.5" /> {timeLimit}
                  </span>
                </div>

                {/* Capacity Drop Box */}
                <div className="bg-[#F4F9FD] border border-slate-150 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Volume Yang Diminta</p>
                    <p className="text-base font-bold text-slate-800 mt-1">{order.volume.toLocaleString()} L</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-500">
                    <Droplets className="w-5 h-5" />
                  </div>
                </div>

                {/* Delivery timing & location */}
                <div className="space-y-3.5 text-[11px] text-slate-600 py-1">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">{schedule}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 border-t border-slate-50 pt-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-750">{destination}</p>
                    </div>
                  </div>
                </div>

                {/* Action footer triggers */}
                <div className="flex gap-2.5 pt-3 border-t border-slate-50">
                  {order.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'DIBATALKAN')}
                        disabled={processingId === order.id}
                        className="flex-1 py-2.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 font-bold text-[11px] transition-all disabled:opacity-50 text-center"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'DIPROSES')}
                        disabled={processingId === order.id}
                        className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-[11px] transition-all disabled:opacity-50 text-center flex items-center justify-center gap-1"
                      >
                        {processingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Konfirmasi Pesanan'}
                      </button>
                    </>
                  ) : order.status === 'DIPROSES' ? (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'SELESAI')}
                      disabled={processingId === order.id}
                      className="w-full py-2.5 rounded-xl bg-emerald-550 hover:bg-emerald-600 text-white font-bold text-[11px] transition-all disabled:opacity-50 text-center flex items-center justify-center gap-1"
                      style={{ backgroundColor: '#10B981' }}
                    >
                      {processingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Selesaikan Pengiriman
                    </button>
                  ) : (
                    <div className="w-full text-center py-1 bg-slate-50 rounded-lg text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Pesanan {order.status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
