'use client';

import { useState, useEffect, useMemo } from 'react';
import { orderAPI } from '@/lib/api';
import { Search, Calendar, Filter, FileText, Loader2, ArrowUpRight, Plus, Download, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  volume: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  vendor: { name: string };
  buyer: { name: string };
}

export default function BuyerHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // Calculate total expenditure dynamically from actual orders
  const totalExpenditure = useMemo(() => {
    const now = new Date();
    const thisMonth = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const total = thisMonth.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return total;
  }, [orders]);

  const orderCountThisMonth = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [orders]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'Semua Status') params.status = statusFilter;
      const res = await orderAPI.getOrders(params);
      setOrders(res.data.data);
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'SELESAI': 
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'MENUNGGU_KONFIRMASI': 
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200';
      case 'DIKONFIRMASI': 
      case 'DISIAPKAN':
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200';
      case 'DALAM_PERJALANAN': 
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200';
      case 'DITOLAK': 
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200';
      default: 
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-650';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Riwayat Transaksi</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola dan pantau semua transaksi distribusi air Anda.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-sm transition-all">
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>
          <Link href="/buyer/dashboard" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all">
            <Plus className="w-4 h-4" /> Pesan Baru
          </Link>
        </div>
      </div>

      {/* Main Filter & Stat Card Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Filter Form Panel */}
        <div className="lg:col-span-2 card p-5">
          <form onSubmit={handleApplyFilter} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Rentang Tanggal</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="date" 
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <span className="text-xs text-slate-400">ke</span>
                  <div className="relative flex-1">
                    <input 
                      type="date" 
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Status Transaksi</label>
                <select
                  id="status-filter"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="MENUNGGU_KONFIRMASI">MENUNGGU KONFIRMASI</option>
                  <option value="DIKONFIRMASI">DIKONFIRMASI</option>
                  <option value="DALAM_PERJALANAN">DALAM PERJALANAN</option>
                  <option value="SELESAI">SELESAI</option>
                  <option value="DITOLAK">DITOLAK</option>
                </select>
              </div>
            </div>

            <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm transition-all">
              Terapkan Filter
            </button>
          </form>
        </div>

        {/* Right Side: Total expenditure Card */}
        <div className="card p-5 bg-gradient-to-br from-primary-500 to-primary-600 text-white flex flex-col justify-between h-[155px]">
          <div>
            <p className="text-[10px] font-bold text-primary-100 uppercase tracking-wider">Total Pengeluaran Bulan Ini</p>
            <h2 className="text-2xl font-bold mt-1.5">Rp {totalExpenditure.toLocaleString()}</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary-100">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>{orderCountThisMonth} transaksi bulan ini</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {/* Desktop View: Transactions Table */}
          <div className="hidden md:block table-container shadow-sm border border-slate-150 rounded-2xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-4 text-left">ID PESANAN</th>
                  <th className="px-5 py-4 text-left">TANGGAL</th>
                  <th className="px-5 py-4 text-left">VENDOR</th>
                  <th className="px-5 py-4 text-left">VOLUME AIR</th>
                  <th className="px-5 py-4 text-left">TOTAL HARGA</th>
                  <th className="px-5 py-4 text-left">STATUS</th>
                  <th className="px-5 py-4 text-left">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      Belum ada riwayat transaksi dengan status ini.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => setDetailOrder(order)} 
                          className="font-bold text-primary-600 hover:underline hover:text-primary-700"
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {order.vendor.name}
                      </td>
                      <td className="px-5 py-4 text-slate-650">
                        {order.volume.toLocaleString()} L
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        Rp {order.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={statusBadge(order.status)}>{order.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        {order.status === 'SELESAI' ? (
                          <button 
                            onClick={() => setDetailOrder(order)} 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all text-[11px]"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-400" /> Unduh Invoice
                          </button>
                        ) : (
                          <button 
                            onClick={() => setDetailOrder(order)} 
                            className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-slate-700 font-bold text-[11px] transition-all"
                          >
                            Detail
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Transaction Cards */}
          <div className="md:hidden space-y-4">
            {orders.length === 0 ? (
              <div className="card p-8 text-center text-slate-400 font-medium">
                Belum ada riwayat transaksi dengan status ini.
              </div>
            ) : (
              orders.map((order, i) => (
                <div key={order.id} className="card p-4 space-y-3 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setDetailOrder(order)} 
                      className="font-bold text-primary-600 hover:underline text-sm"
                    >
                      {order.orderNumber}
                    </button>
                    <span className={statusBadge(order.status)}>{order.status}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-y border-slate-100 py-3">
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Vendor</p>
                      <p className="font-bold text-slate-750 mt-0.5">{order.vendor.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Volume Air</p>
                      <p className="font-bold text-slate-700 mt-0.5">{order.volume.toLocaleString()} L</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Total Harga</p>
                      <p className="font-bold text-slate-800 mt-0.5">Rp {order.totalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Tanggal</p>
                      <p className="text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    {order.status === 'SELESAI' ? (
                      <button 
                        onClick={() => setDetailOrder(order)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold text-[11px] hover:bg-slate-50 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" /> Invoice
                      </button>
                    ) : (
                      <button 
                        onClick={() => setDetailOrder(order)} 
                        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-150 text-slate-600 font-bold text-[11px] hover:bg-slate-100 transition-all"
                      >
                        Detail
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Table Footer Pagination matching PDF exactly (Responsive) */}
          {orders.length > 0 && (
            <div className="card px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <span className="text-center sm:text-left">Menampilkan 1-{orders.length} dari {orders.length} transaksi</span>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed hover:bg-slate-50">&lt;</button>
                <button className="px-3 py-1 rounded bg-primary-600 text-white font-bold">1</button>
                <button className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50">2</button>
                <button className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50">3</button>
                <button className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50">&gt;</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Detail Pesanan</h3>
              <button onClick={() => setDetailOrder(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3.5 text-xs text-slate-650">
              <div className="flex justify-between"><span className="text-slate-500">No. Pesanan</span><span className="font-bold text-slate-800">{detailOrder.orderNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Vendor</span><span className="font-bold text-slate-800">{detailOrder.vendor.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Volume</span><span className="font-semibold text-slate-800">{detailOrder.volume.toLocaleString()} L</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tanggal Transaksi</span><span className="font-medium text-slate-800">{new Date(detailOrder.createdAt).toLocaleDateString('id-ID')}</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Status Transaksi</span><span className={statusBadge(detailOrder.status)}>{detailOrder.status}</span></div>
              <div className="border-t border-slate-100 pt-3.5 flex justify-between text-sm font-bold"><span className="text-slate-700">Total Pembayaran</span><span className="text-primary-600">Rp {detailOrder.totalPrice.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
