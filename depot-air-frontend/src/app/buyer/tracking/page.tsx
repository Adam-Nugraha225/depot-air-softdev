'use client';

import { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/api';
import { Truck, MapPin, Phone, MessageSquare, Download, CheckCircle2, Loader2, FileText, X, Package } from 'lucide-react';
import Link from 'next/link';
import OpenStreetMapEmbed, { geocodeAddress } from '@/components/maps/OpenStreetMapEmbed';

interface Order {
  id: string;
  orderNumber: string;
  volume: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  address?: string;
  vendor: { 
    id: string; 
    name: string; 
    phone?: string;
    vendorProfile?: {
      mainLocation?: string;
    };
  };
  buyer: { name: string; phone?: string };
  assignedFleet?: { id: string; truckId: string; driverName: string; status?: string; lat?: number; lng?: number };
  waterType?: string;
  deliveryNotes?: string;
}

const DEFAULT_MAP_CENTER = {
  lat: -6.2615,
  lng: 107.1528,
};

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
      const allOrders = res.data.data || [];
      setOrders(allOrders);

      const active = allOrders.find((o: Order) => o.status !== 'SELESAI' && o.status !== 'DITOLAK');
      setSelectedOrder(active || allOrders[0] || null);
    } catch {
      setOrders([]);
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!selectedOrder) return;
    setShowInvoiceModal(false);
    setToastMessage(`Invoice ${selectedOrder.orderNumber}.${invoiceFormat.toLowerCase()} siap diunduh.`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  if (!selectedOrder) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Pelacakan Pesanan</h1>
            <p className="text-xs text-slate-500 mt-0.5">Informasi real-time status distribusi air Anda.</p>
          </div>
          <Link
            href="/buyer/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 shadow-sm transition-all"
          >
            <Package className="w-4 h-4" /> Buat Pesanan
          </Link>
        </div>

        <div className="card p-12 text-center">
          <Package className="w-14 h-14 text-slate-250 mx-auto mb-4" />
          <h2 className="text-base font-bold text-slate-800 mb-2">Belum Ada Pesanan</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Akun ini belum memiliki pesanan. Setelah Anda membuat pesanan, status pengiriman dan peta armada akan tampil di sini.
          </p>
        </div>
      </div>
    );
  }

  const order = selectedOrder;
  const stepIndex = order.status === 'MENUNGGU_KONFIRMASI' ? 0 :
                    (order.status === 'DIKONFIRMASI' || order.status === 'DISIAPKAN') ? 1 :
                    order.status === 'DALAM_PERJALANAN' ? 2 :
                    order.status === 'SELESAI' ? 3 : 1;

  // Resolve map coordinates
  const vendorCoords = geocodeAddress(order.vendor?.vendorProfile?.mainLocation || '') || geocodeAddress('Dago Atas') || { lat: -6.8533, lng: 107.6173 };
  const buyerCoords = geocodeAddress(order.address || '') || geocodeAddress('Kabupaten Bandung') || { lat: -7.0208, lng: 107.5881 };

  const hasFleetLocation = typeof order.assignedFleet?.lat === 'number' && typeof order.assignedFleet?.lng === 'number';
  let truckLat: number | undefined = undefined;
  let truckLng: number | undefined = undefined;

  if (order.status === 'DALAM_PERJALANAN') {
    if (hasFleetLocation) {
      truckLat = order.assignedFleet!.lat!;
      truckLng = order.assignedFleet!.lng!;
    } else {
      // Mock / simulate truck position halfway between vendor and buyer coordinates
      truckLat = (vendorCoords.lat + buyerCoords.lat) / 2;
      truckLng = (vendorCoords.lng + buyerCoords.lng) / 2;
    }
  }

  const driverName = order.assignedFleet?.driverName || 'Belum ditugaskan';
  const truckId = order.assignedFleet?.truckId || 'Armada belum ditentukan';

  return (
    <div className="space-y-6 animate-fade-in relative">
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
        <div className="card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-primary-100 text-primary-700 font-bold text-[10px] rounded-full uppercase tracking-wider">
                {order.status.replace(/_/g, ' ')}
              </span>
              <span className="font-bold text-slate-800 text-sm">{order.orderNumber}</span>
            </div>
            <div className="text-xs text-slate-500 sm:text-right">
              <span>Dibuat: </span>
              <strong className="text-primary-600 font-bold">
                {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative py-2">
            {[
              { label: 'Pesanan Diterima', time: 'Tercatat' },
              { label: 'Diproses & Disiapkan', time: 'Menunggu vendor' },
              { label: 'Dalam Perjalanan', time: 'Armada berjalan' },
              { label: 'Sampai di Lokasi', time: 'Selesai' },
            ].map((step, index) => {
              const isActive = index <= stepIndex;
              const isCurrent = index === stepIndex;
              return (
                <div key={index} className="flex md:flex-col items-center gap-3 md:text-center relative">
                  {index < 3 && (
                    <div className={`hidden md:block absolute top-4 left-[60%] w-[80%] h-0.5 -z-10 ${
                      index < stepIndex ? 'bg-primary-500' : 'bg-slate-150'
                    }`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent ? 'bg-primary-500 text-white ring-4 ring-primary-100 scale-110' :
                    isActive ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isActive ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : index + 1}
                  </div>
                  <div>
                    <p className={`font-bold text-xs ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-150 h-80 bg-slate-100">
            <OpenStreetMapEmbed
              vendorLat={vendorCoords.lat}
              vendorLng={vendorCoords.lng}
              buyerLat={buyerCoords.lat}
              buyerLng={buyerCoords.lng}
              truckLat={truckLat}
              truckLng={truckLng}
              vendorLabel={order.vendor.name}
              buyerLabel={order.buyer.name}
              truckLabel={order.assignedFleet?.driverName ? `Armada - ${order.assignedFleet.driverName}` : 'Armada Pengiriman'}
              zoom={hasFleetLocation ? 14 : 12}
              title={`Peta pesanan ${order.orderNumber}`}
            />

            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-slate-100 max-w-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 text-[11px]">
                    {hasFleetLocation ? 'Lokasi armada saat ini' : 'Rute pengiriman'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {hasFleetLocation
                      ? `${order.assignedFleet!.lat!.toFixed(5)}, ${order.assignedFleet!.lng!.toFixed(5)}`
                      : order.status === 'DALAM_PERJALANAN' 
                        ? 'Simulasi rute perjalanan armada.'
                        : 'Menunggu armada berangkat.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-100 max-w-xs">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 text-[11px]">{truckId}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pengemudi: {driverName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Informasi Kurir</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                {driverName.split(' ').map(n => n[0]).slice(0, 2).join('') || 'NA'}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{driverName}</h4>
                <p className="text-xs text-slate-500">{truckId}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Data armada dari backend</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/buyer/chat?vendorId=${order.vendor.id}&vendorName=${encodeURIComponent(order.vendor.name)}`}
                className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-primary-600 font-bold text-xs border border-slate-200/60 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat
              </Link>
              {order.vendor.phone ? (
                <a
                  href={`tel:${order.vendor.phone}`}
                  className="flex-1 py-2 rounded-xl bg-emerald-550 hover:bg-emerald-600 text-white font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Phone className="w-3.5 h-3.5" /> Hubungi
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs text-center flex items-center justify-center gap-1.5 cursor-not-allowed"
                >
                  <Phone className="w-3.5 h-3.5" /> Tidak Ada Nomor
                </button>
              )}
            </div>
          </div>

          <div className="card p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Ringkasan Pesanan</h3>
            <div className="space-y-2.5 text-xs text-slate-650 pt-1">
              <div className="flex justify-between">
                <span>Volume</span>
                <span className="font-bold text-slate-800">{order.volume.toLocaleString()} Liter</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe Air</span>
                <span className="font-semibold text-slate-850">{order.waterType || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Vendor</span>
                <span className="font-semibold text-slate-850">{order.vendor.name}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2.5">
                <span>Total</span>
                <span className="font-bold text-primary-600">Rp {order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Catatan Pengiriman</h3>
              <p className="text-xs text-slate-600 italic">{order.deliveryNotes || 'Belum ada catatan pengiriman.'}</p>
            </div>
            <div className="border-t border-slate-100 pt-3.5 space-y-1.5">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Penerima</h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-primary-500" />
                <span>{order.buyer?.name || 'Data penerima belum tersedia'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvoiceModal && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Unduh Invoice</h3>
              <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <p className="text-xs text-slate-500 mb-5">Pilih format dokumen untuk pesanan <strong>#{order.orderNumber}</strong></p>

            <div className="space-y-4 mb-6">
              {(['PDF', 'CSV'] as const).map(format => (
                <label
                  key={format}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                    invoiceFormat === format ? 'border-primary-500 bg-primary-50/20' : 'border-slate-150 bg-white hover:border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    className="hidden"
                    checked={invoiceFormat === format}
                    onChange={() => setInvoiceFormat(format)}
                  />
                  <div>
                    <p className="font-bold text-xs text-slate-800">{format === 'PDF' ? 'PDF Document' : 'CSV Spreadsheet'}</p>
                    <p className="text-[10px] text-slate-455 mt-0.5">
                      {format === 'PDF' ? 'Untuk arsip dan cetak invoice.' : 'Untuk data spreadsheet.'}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    invoiceFormat === format ? 'border-primary-500 bg-primary-500' : 'border-slate-300 bg-white'
                  }`}>
                    {invoiceFormat === format && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </label>
              ))}
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