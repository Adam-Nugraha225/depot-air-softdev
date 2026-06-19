'use client';

import { useState, useEffect } from 'react';
import { orderAPI, chatAPI } from '@/lib/api';
import { Truck, MapPin, Phone, MessageSquare, Download, Clock, CheckCircle2, Circle, Loader2, FileText, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  volume: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  vendor: { id: string; name: string; phone?: string };
  buyer: { name: string; phone?: string };
  assignedFleet?: { id: string; truckId: string; driverName: string; status?: string; lat?: number; lng?: number };
}

export default function BuyerTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceFormat, setInvoiceFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      const allOrders = res.data.data;
      setOrders(allOrders);
      // Look for first non-completed, non-cancelled order
      const active = allOrders.find((o: Order) => o.status !== 'SELESAI' && o.status !== 'DIBATALKAN');
      if (active) {
        setSelectedOrder(active);
      } else if (allOrders.length > 0) {
        // Fallback to latest order
        setSelectedOrder(allOrders[0]);
      }
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    setShowInvoiceModal(false);
    setToastMessage(`Invoice ${selectedOrder?.orderNumber || 'VH-8821-X90'}.${invoiceFormat.toLowerCase()} (212 KB. DONE)`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  // Use selected order or fallback to a realistic mockup matching PDF Page 4
  const order = selectedOrder || {
    id: 'mock-id',
    orderNumber: 'VH-8821-X90',
    volume: 8000,
    totalPrice: 2400000,
    status: 'DIKIRIM',
    createdAt: new Date().toISOString(),
    vendor: { id: 'mock-vendor', name: 'AquaStream Logistics' },
    buyer: { name: 'Budi Hartanto' },
    assignedFleet: {
      id: 'mock-fleet',
      truckId: 'AG 1234 B',
      driverName: 'Adi Santoso'
    }
  };

  const stepIndex = order.status === 'PENDING' ? 0 : 
                      order.status === 'DIPROSES' ? 1 : 
                      order.status === 'DIKIRIM' ? 2 : 
                      order.status === 'SELESAI' ? 3 : 2;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900/95 text-white px-5 py-3.5 rounded-xl shadow-xl z-50 flex items-center justify-between gap-4 animate-slide-up text-xs border border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-primary-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setShowToast(false)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pelacakan Pesanan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Informasi real-time status distribusi air Anda.</p>
        </div>
        <button 
          onClick={() => setShowInvoiceModal(true)} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-slate-500" /> Unduh Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Main Status Panel */}
        <div className="card p-6 space-y-6">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-primary-100 text-primary-700 font-bold text-[10px] rounded-full uppercase tracking-wider animate-pulse-soft">
                AKTIF SEKARANG
              </span>
              <span className="font-bold text-slate-800 text-sm">{order.orderNumber}</span>
            </div>
            <div className="text-xs text-slate-500 sm:text-right">
              <span>Estimasi Kedatangan: </span>
              <strong className="text-primary-600 font-bold">14:45 WIB (Hari ini)</strong>
            </div>
          </div>

          {/* Stepper Timeline (Horizontal on md, stack vertical on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative py-2">
            {[
              { label: 'Pesanan Diproses', time: '08:30 WIB' },
              { label: 'Dalam Perjalanan', time: '10:15 WIB' },
              { label: 'Kurir Hampir Sampai', time: 'Estimasi 14:15' },
              { label: 'Sampai di Lokasi', time: 'Segera' },
            ].map((step, index) => {
              const isActive = index <= stepIndex;
              const isCurrent = index === stepIndex;
              return (
                <div key={index} className="flex md:flex-col items-center gap-3 md:text-center relative">
                  {/* Connection Line */}
                  {index < 3 && (
                    <div className={`hidden md:block absolute top-4 left-[60%] w-[80%] h-0.5 -z-10 ${
                      index < stepIndex ? 'bg-primary-500' : 'bg-slate-150'
                    }`} />
                  )}
                  {/* Circle Step */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent ? 'bg-primary-500 text-white ring-4 ring-primary-100 scale-110' :
                    isActive ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isActive ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <p className={`font-bold text-xs ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Section */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-150 h-80 bg-slate-100">
            {/* Mock Map Background Visual */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/107.720,-6.920,13,0/1200x400?access_token=mock')" }}>
              {/* Fallback pattern in case Mapbox request fails */}
              <div className="w-full h-full bg-[#E5E9F0] opacity-90 relative">
                {/* Decorative map elements */}
                <div className="absolute w-[200px] h-[8px] bg-white/50 rotate-12 top-20 left-10 rounded-full" />
                <div className="absolute w-[300px] h-[8px] bg-white/50 -rotate-45 top-40 left-40 rounded-full" />
                <div className="absolute w-[250px] h-[8px] bg-white/50 rotate-30 bottom-16 left-20 rounded-full" />
                <div className="absolute w-full h-full border-[6px] border-dashed border-primary-500/10 pointer-events-none" />
                
                {/* Path Trace line */}
                <svg className="absolute w-full h-full pointer-events-none">
                  <path 
                    d="M 120 180 Q 280 160 480 200 T 780 120" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="4" 
                    strokeDasharray="8 6"
                  />
                </svg>

                {/* User Pin */}
                <div className="absolute top-[120px] left-[780px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="bg-red-500 text-white p-1.5 rounded-full shadow-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold bg-white text-slate-800 px-2 py-0.5 rounded shadow-sm mt-1 border border-slate-100">Lokasi Anda</span>
                </div>

                {/* Driver Pin */}
                <div className="absolute top-[185px] left-[320px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-pulse-soft">
                  <div className="bg-primary-600 text-white p-2 rounded-full shadow-lg ring-4 ring-primary-100">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold bg-primary-600 text-white px-2 py-0.5 rounded shadow-sm mt-1 border border-primary-500">Driver Sekarang</span>
                </div>
              </div>
            </div>

            {/* Bottom-left Location Badge */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-100 max-w-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                    ▲ Jl. Raya Industri Km 12
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Armada di dekat Gerbang Tol Cikarang Barat.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid (Courier, Summary, Notes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Courier Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Informasi Kurir</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                {order.assignedFleet?.driverName?.split(' ').map(n => n[0]).join('') || 'AS'}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{order.assignedFleet?.driverName || 'Adi Santoso'}</h4>
                <p className="text-xs text-slate-500">{order.assignedFleet?.truckId || 'AG 1234 B • Truk Tangki'}</p>
                <p className="text-[10px] text-amber-500 mt-0.5">★ 4.9 (120+ Antaran)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/buyer/chat`}
                className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-primary-600 font-bold text-xs border border-slate-200/60 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat
              </Link>
              <a 
                href={`tel:${order.vendor.phone || '+62812345678'}`}
                className="flex-1 py-2 rounded-xl bg-emerald-550 hover:bg-emerald-600 text-white font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
                style={{ backgroundColor: '#10B981' }}
              >
                <Phone className="w-3.5 h-3.5" /> Hubungi
              </a>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Ringkasan Pesanan</h3>
            <div className="space-y-2.5 text-xs text-slate-650 pt-1">
              <div className="flex justify-between">
                <span>Volume</span>
                <span className="font-bold text-slate-800">{order.volume.toLocaleString()} Liter</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe Air</span>
                <span className="font-semibold text-slate-850">Air Mineral Pegunungan</span>
              </div>
              <div className="flex justify-between">
                <span>Vendor</span>
                <span className="font-semibold text-slate-850">{order.vendor.name}</span>
              </div>
            </div>
          </div>

          {/* Shipping Notes & Destination */}
          <div className="card p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Catatan Pengiriman</h3>
              <p className="text-xs text-slate-600 italic">"Gunakan pintu belakang untuk bongkar muat."</p>
            </div>
            <div className="border-t border-slate-100 pt-3.5 space-y-1.5">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Lokasi Tujuan</h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-primary-500" />
                <span>Gudang Bangkit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unduh Invoice Popup */}
      {showInvoiceModal && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Unduh Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <p className="text-xs text-slate-500 mb-5">Pilih format dokumen yang Anda inginkan untuk pesanan <strong>#{order.orderNumber}</strong></p>

            <div className="space-y-4 mb-6">
              {/* PDF Selection */}
              <label 
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                  invoiceFormat === 'PDF' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-150 bg-white hover:border-slate-200'
                }`}
              >
                <input 
                  type="radio" 
                  name="format" 
                  className="hidden" 
                  checked={invoiceFormat === 'PDF'} 
                  onChange={() => setInvoiceFormat('PDF')} 
                />
                <div>
                  <p className="font-bold text-xs text-slate-800">PDF Document</p>
                  <p className="text-[10px] text-slate-455 mt-0.5">Recommended for printing and official records.</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  invoiceFormat === 'PDF' ? 'border-primary-500 bg-primary-500' : 'border-slate-300 bg-white'
                }`}>
                  {invoiceFormat === 'PDF' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>

              {/* CSV Selection */}
              <label 
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                  invoiceFormat === 'CSV' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-150 bg-white hover:border-slate-200'
                }`}
              >
                <input 
                  type="radio" 
                  name="format" 
                  className="hidden" 
                  checked={invoiceFormat === 'CSV'} 
                  onChange={() => setInvoiceFormat('CSV')} 
                />
                <div>
                  <p className="font-bold text-xs text-slate-800">CSV Spreadsheet</p>
                  <p className="text-[10px] text-slate-455 mt-0.5">Best for data analysis and bookkeeping.</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  invoiceFormat === 'CSV' ? 'border-primary-500 bg-primary-500' : 'border-slate-300 bg-white'
                }`}>
                  {invoiceFormat === 'CSV' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>
            </div>

            <div className="flex gap-3 justify-end text-xs">
              <button 
                type="button" 
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-all"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleDownload}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm transition-all"
              >
                Unduh Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
