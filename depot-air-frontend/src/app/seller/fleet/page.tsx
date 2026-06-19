'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { fleetAPI, orderAPI } from '@/lib/api';
import { Truck, Plus, X, Loader2, Save, MapPin, User, ChevronDown, AlertCircle, CheckCircle2, Clock, Wrench, Search } from 'lucide-react';

interface Fleet {
  id: string;
  truckId: string;
  driverName: string;
  truckType?: string;
  licensePlate?: string;
  capacity?: number;
  status: string;
  lat?: number;
  lng?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  volume: number;
  status: string;
  buyer: { name: string };
}

export default function SellerFleet() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  const [selectedFleetId, setSelectedFleetId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  
  // Specific vehicle inputs as shown in PDF Page 12
  const [formTruckId, setFormTruckId] = useState('');
  const [formDriverName, setFormDriverName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [capacityLiters, setCapacityLiters] = useState('15000');
  
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fleetsRes, ordersRes] = await Promise.all([
        fleetAPI.getFleets(),
        orderAPI.getOrders({ status: 'DIKONFIRMASI' })
      ]);
      setFleets(fleetsRes.data.data);
      setOrders(ordersRes.data.data.filter((o: Order) => o.status === 'DIKONFIRMASI'));
    } catch { } finally {
      setLoading(false);
    }
  };

  const handleAddFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await fleetAPI.addFleet({ 
        truckId: formTruckId, 
        driverName: formDriverName,
        truckType: vehicleModel || undefined,
        licensePlate: plateNumber || undefined,
        capacity: capacityLiters ? parseInt(capacityLiters) : undefined,
      });
      await loadData();
      setShowAddModal(false);
      setFormTruckId('');
      setFormDriverName('');
      setVehicleModel('');
      setPlateNumber('');
      setCapacityLiters('15000');
      showToast('Kendaraan baru berhasil ditambahkan!', 'success');
    } catch {
      showToast('Gagal menambahkan kendaraan. Coba lagi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedFleetId || !selectedOrderId) return;
    setSaving(true);
    try {
      await fleetAPI.assignFleetToOrder({ orderId: selectedOrderId, fleetId: selectedFleetId });
      await loadData();
      setShowAssignModal(false);
      showToast('Armada berhasil ditugaskan ke pesanan!', 'success');
    } catch {
      showToast('Gagal menugaskan armada. Coba lagi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (fleetId: string, status: string) => {
    try {
      await fleetAPI.updateFleetStatus(fleetId, { status });
      await loadData();
      const msg = status === 'TERSEDIA' ? 'Armada berhasil diaktifkan!' : `Status armada diperbarui ke ${status}.`;
      showToast(msg, 'success');
    } catch {
      showToast('Gagal memperbarui status armada. Coba lagi.', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TERSEDIA': 
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-250';
      case 'SEDANG_BERTUGAS': 
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-250';
      case 'PEMELIHARAAN': 
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-250';
      default: 
        return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-650 border border-slate-200';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  // Extract vehicle & driver details from fleet fields
  const parseFleetDetails = (fleet: Fleet) => {
    const driver = fleet.driverName;
    const model = fleet.truckType || 'Volvo FH16';
    const plate = fleet.licensePlate || 'B 1234 CD';
    const modelPlate = `${model}, Plat: ${plate}`;
    return { driver, modelPlate };
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Armada</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola armada logistik air Anda, kapasitas, dan penugasan aktif.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 flex-shrink-0 self-start">
          <Plus className="w-4 h-4" /> Tambah Kendaraan Baru
        </button>
      </div>

      {/* Three Summary Blocks at top */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card p-4 flex items-center justify-between border border-slate-100 bg-white">
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-800">8</h4>
            <p className="text-[10px] text-slate-400">Siap Dikirim</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between border border-slate-100 bg-white">
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-800">12</h4>
            <p className="text-[10px] text-slate-400">Pengiriman Aktif</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between border border-slate-100 bg-white">
          <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-800">2</h4>
            <p className="text-[10px] text-slate-400">Di Bengkel</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="fleet-search"
            type="text"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs"
            placeholder="Cari armada, driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <select 
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer min-w-[150px] appearance-none pr-10"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Semua Status">Semua Status</option>
            <option value="TERSEDIA">Tersedia</option>
            <option value="SEDANG_BERTUGAS">Sedang Bertugas</option>
            <option value="PEMELIHARAAN">Pemeliharaan</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Fleets Desktop Table */}
        <div className="hidden md:block table-container shadow-sm border border-slate-150 rounded-2xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-4 text-left">ID TRUK</th>
                <th className="px-5 py-4 text-left">DETAIL TRUK</th>
                <th className="px-5 py-4 text-left">KAPASITAS</th>
                <th className="px-5 py-4 text-left">STATUS</th>
                <th className="px-5 py-4 text-left">PENUGASAN SAAT INI</th>
                <th className="px-5 py-4 text-left">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {fleets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                    Belum ada armada terdaftar.
                  </td>
                </tr>
              ) : (
                fleets.map((fleet) => {
                  const { driver, modelPlate } = parseFleetDetails(fleet);
                  const status = fleet.status === 'TERSEDIA' ? 'Tersedia' : 
                                 fleet.status === 'SEDANG_BERTUGAS' ? 'Sedang Bertugas' : 'Pemeliharaan';

                  return (
                    <tr key={fleet.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-primary-600">
                        #{fleet.truckId}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{modelPlate.split(',')[0]}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{modelPlate.split(',')[1]?.trim() || 'Plat: B 1234 CD'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {fleet.capacity ? `${fleet.capacity.toLocaleString()} L` : '15.000 L'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={getStatusBadge(fleet.status)}>{status}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-650">
                        {fleet.status === 'SEDANG_BERTUGAS' ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-850">Aktif Pengiriman</p>
                            <p className="text-[10px] text-slate-400">Truk sedang bertugas mengantar air</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum Ditugaskan</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {fleet.status === 'TERSEDIA' ? (
                          <button 
                            onClick={() => { setSelectedFleetId(fleet.id); setShowAssignModal(true); }}
                            className="px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-[10px] shadow-sm transition-all"
                          >
                            Tugaskan Armada
                          </button>
                        ) : fleet.status === 'SEDANG_BERTUGAS' ? (
                          <button 
                            onClick={() => handleStatusUpdate(fleet.id, 'TERSEDIA')}
                            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] shadow-sm transition-all"
                          >
                            Selesaikan Tugas
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusUpdate(fleet.id, 'TERSEDIA')}
                            className="text-primary-600 hover:text-primary-700 font-bold text-[10px]"
                          >
                            Aktifkan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Fleet Cards */}
        <div className="md:hidden space-y-4">
          {fleets.length === 0 ? (
            <div className="card p-8 text-center text-slate-400 font-semibold">
              Belum ada armada terdaftar.
            </div>
          ) : (
            fleets.map((fleet, i) => {
              const { driver, modelPlate } = parseFleetDetails(fleet);
              const status = fleet.status === 'TERSEDIA' ? 'Tersedia' : 
                             fleet.status === 'SEDANG_BERTUGAS' ? 'Sedang Bertugas' : 'Pemeliharaan';

              return (
                <div key={fleet.id} className="card p-4 space-y-3 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-600">#{fleet.truckId}</span>
                    <span className={getStatusBadge(fleet.status)}>{status}</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-450 flex-shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{modelPlate.split(',')[0]}</p>
                      <p className="text-[10px] text-slate-405 mt-0.5">{modelPlate.split(',')[1]?.trim() || 'Plat: B 1234 CD'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Kapasitas</p>
                      <p className="font-bold text-slate-700 mt-0.5">{fleet.capacity ? `${fleet.capacity.toLocaleString()} L` : '15.000 L'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold text-[10px] uppercase">Driver</p>
                      <p className="font-bold text-slate-700 mt-0.5">{driver || '-'}</p>
                    </div>
                  </div>

                  {fleet.status === 'SEDANG_BERTUGAS' && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-500">
                      <p className="font-bold text-slate-700">Aktif Pengiriman</p>
                      <p className="mt-0.5">Truk sedang bertugas mengantar air</p>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-3 flex justify-end">
                    {fleet.status === 'TERSEDIA' ? (
                      <button 
                        onClick={() => { setSelectedFleetId(fleet.id); setShowAssignModal(true); }}
                        className="px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-[10px] shadow-sm transition-all"
                      >
                        Tugaskan Armada
                      </button>
                    ) : fleet.status === 'SEDANG_BERTUGAS' ? (
                      <button 
                        onClick={() => handleStatusUpdate(fleet.id, 'TERSEDIA')}
                        className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] shadow-sm transition-all"
                      >
                        Selesaikan Tugas
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusUpdate(fleet.id, 'TERSEDIA')}
                        className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-primary-600 font-bold text-[10px] shadow-sm transition-all"
                      >
                        Aktifkan
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info pagination matching PDF (Responsive) */}
        {fleets.length > 0 && (
          <div className="card px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span className="text-center sm:text-left">Menampilkan 1 hingga {fleets.length} dari {fleets.length} data</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed hover:bg-slate-50">&lt;</button>
              <button className="px-3 py-1 rounded bg-primary-600 text-white font-bold">1</button>
              <button className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50">2</button>
              <button className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50">&gt;</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Fleet Modal (Page 12 pop-up) */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Tambah Kendaraan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleAddFleet} className="space-y-4">
              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">ID Truk</label>
                <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs" placeholder="Contoh: TRK-042" value={formTruckId} onChange={(e) => setFormTruckId(e.target.value)} required />
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">Model Kendaraan</label>
                <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs" placeholder="Contoh: Volvo FH16" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} required />
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">Nomor Plat</label>
                <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs" placeholder="Contoh: B 1234 CD" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} required />
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">Nama Driver</label>
                <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs" placeholder="Contoh: John Doe" value={formDriverName} onChange={(e) => setFormDriverName(e.target.value)} required />
              </div>

              <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Simpan</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Assign Fleet Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Tugaskan Armada</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">Pilih Pesanan Masuk</label>
                <div className="relative">
                  <select 
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer appearance-none pr-10" 
                    value={selectedOrderId} 
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                  >
                    <option value="">-- Pilih pesanan --</option>
                    {orders.map(o => <option key={o.id} value={o.id}>{o.orderNumber} - {o.buyer.name} ({o.volume.toLocaleString()} L)</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <button onClick={handleAssign} disabled={saving || !selectedFleetId || !selectedOrderId} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all mt-4">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Truck className="w-4 h-4" /> Tugaskan</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
