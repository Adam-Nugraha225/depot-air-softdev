'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { userAPI } from '@/lib/api';
import { User, MapPin, Phone, Mail, Save, Plus, Pencil, Trash2, X, Loader2, CheckCircle2, Star, Eye } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  addressLine: string;
  isPrimary: boolean;
}

export default function BuyerSettings() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Specific address fields as shown in PDF Page 9
  const [addressForm, setAddressForm] = useState({
    label: '',
    recipientName: '',
    cityRegion: '',
    streetAddress: '',
    otherDetails: '',
    isPrimary: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const res = await userAPI.getAddresses();
      setAddresses(res.data.data);
    } catch { } finally {
      setAddressLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await userAPI.updateProfile({ name, phone });
      await refreshProfile();
      setProfileSaved(true);
      showToast('Profil berhasil diperbarui!', 'success');
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {
      showToast('Gagal menyimpan profil. Coba lagi.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setAddressForm({
      label: 'Lokasi Baru',
      recipientName: '',
      cityRegion: '',
      streetAddress: '',
      otherDetails: '',
      isPrimary: false
    });
    setShowAddressModal(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    
    // Parse the addressLine into our 4 fields. If it fails, dump it into streetAddress
    const parts = addr.addressLine.split('\n');
    let recipientName = '';
    let streetAddress = addr.addressLine;
    let cityRegion = '';
    let otherDetails = '';

    if (parts.length >= 3) {
      recipientName = parts[0].trim();
      streetAddress = parts[1].trim();
      
      const rest = parts.slice(2).join('\n').trim();
      // Split between cityRegion and otherDetails if possible
      const detailsIndex = rest.indexOf('(');
      if (detailsIndex !== -1) {
        cityRegion = rest.substring(0, detailsIndex).trim();
        otherDetails = rest.substring(detailsIndex + 1, rest.length - 1).trim();
      } else {
        cityRegion = rest;
      }
    }

    setAddressForm({
      label: addr.label,
      recipientName: recipientName || user?.name || '',
      cityRegion: cityRegion || '',
      streetAddress: streetAddress || '',
      otherDetails: otherDetails || '',
      isPrimary: addr.isPrimary
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    
    // Combine the 4 fields into a formatted addressLine matching the database schema
    const combinedLine = `${addressForm.recipientName}\n${addressForm.streetAddress}\n${addressForm.cityRegion} (${addressForm.otherDetails})`;
    
    const payload = {
      label: addressForm.label,
      addressLine: combinedLine,
      isPrimary: addressForm.isPrimary
    };

    try {
      if (editingAddress) {
        await userAPI.updateAddress(editingAddress.id, payload);
        showToast('Alamat berhasil diperbarui!', 'success');
      } else {
        await userAPI.addAddress(payload);
        showToast('Alamat baru berhasil ditambahkan!', 'success');
      }
      await loadAddresses();
      setShowAddressModal(false);
    } catch {
      showToast('Gagal menyimpan alamat. Coba lagi.', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Yakin ingin menghapus alamat ini?')) return;
    try {
      await userAPI.deleteAddress(id);
      await loadAddresses();
      showToast('Alamat berhasil dihapus.', 'success');
    } catch {
      showToast('Gagal menghapus alamat. Coba lagi.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-800">Pengaturan Akun</h1>

      {/* Profil Pribadi Card */}
      <div className="card p-6">
        <h2 className="text-sm font-bold text-slate-450 uppercase tracking-wider mb-5">Profil Pribadi</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-3xl shadow-sm overflow-hidden">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button type="button" className="text-[10px] font-bold text-primary-650 hover:text-primary-700 hover:underline">
              Ganti Foto
            </button>
          </div>

          <form onSubmit={handleProfileSave} className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Nama Lengkap</label>
              <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Email</label>
              <input type="email" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400 cursor-not-allowed focus:outline-none" value={user?.email || 'budi.hartanto@email.com'} disabled />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Nomor Telepon</label>
              <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">ID Pengguna</label>
              <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400 cursor-not-allowed focus:outline-none" value={user?.role === 'VENDOR' ? 'VH-SELLER-2024' : 'VH-BUDI-2024'} disabled />
            </div>

            <div className="sm:col-span-2 mt-2">
              <button type="submit" disabled={profileLoading} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all">
                {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : profileSaved ? <><CheckCircle2 className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Alamat Pengiriman Air Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-455 uppercase tracking-wider">Alamat Pengiriman Air</h2>
          <button onClick={openAddModal} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm transition-all">
            <Plus className="w-3.5 h-3.5" /> Tambah Lokasi Baru
          </button>
        </div>

        {addressLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => {
              // Parse displays nicely
              const lines = addr.addressLine.split('\n');
              const recipient = lines[0] || user?.name || '';
              const street = lines[1] || addr.addressLine;
              const region = lines.slice(2).join('\n') || '';

              return (
                <div key={addr.id} className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  addr.isPrimary ? 'border-primary-300 bg-primary-50/10' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 text-xs truncate max-w-[120px]">{addr.label}</h4>
                      {addr.isPrimary && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 font-bold rounded-full text-[9px] flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" /> Utama
                        </span>
                      )}
                    </div>
                    
                    {/* Display parsed info */}
                    <div className="text-xs text-slate-500 space-y-1 mt-1 leading-relaxed">
                      <p className="font-semibold text-slate-700 text-[11px]">{recipient}</p>
                      <p className="text-[11px] text-slate-600">{street}</p>
                      <p className="text-[10px] text-slate-400">{region}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50">
                    <button onClick={() => openEditModal(addr)} className="text-[10px] font-bold text-primary-650 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Dotted border card matching PDF */}
            <div 
              onClick={openAddModal}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-300 hover:bg-slate-50/50 transition-all text-center min-h-[170px]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold text-xs text-slate-550">Tambah Lokasi Distribusi</span>
            </div>
          </div>
        )}
      </div>

      {/* Address Form Popup Modal (Page 9) */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingAddress ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
              </h3>
              <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">Label Alamat</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" 
                  placeholder="Contoh: Gudang Jakarta Pusat" 
                  value={addressForm.label} 
                  onChange={(e) => setAddressForm(p => ({ ...p, label: e.target.value }))} 
                  required 
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">Nama Penerima</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" 
                  placeholder="Nama Lengkap Penerima" 
                  value={addressForm.recipientName} 
                  onChange={(e) => setAddressForm(p => ({ ...p, recipientName: e.target.value }))} 
                  required 
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">Provinsi, Kota, Kecamatan, Kode Pos</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" 
                  placeholder="Senayan, Jakarta Pusat, 10210" 
                  value={addressForm.cityRegion} 
                  onChange={(e) => setAddressForm(p => ({ ...p, cityRegion: e.target.value }))} 
                  required 
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">Nama Jalan & No. Bangunan</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" 
                  placeholder="Jl. Sudirman No. 45" 
                  value={addressForm.streetAddress} 
                  onChange={(e) => setAddressForm(p => ({ ...p, streetAddress: e.target.value }))} 
                  required 
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1.5 block">Detail Lainnya (Patokan / Catatan)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" 
                  placeholder="Contoh: Kavling 3-4, Seberang Gedung BRI" 
                  value={addressForm.otherDetails} 
                  onChange={(e) => setAddressForm(p => ({ ...p, otherDetails: e.target.value }))} 
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer py-1">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-350 accent-primary-500" 
                  checked={addressForm.isPrimary} 
                  onChange={(e) => setAddressForm(p => ({ ...p, isPrimary: e.target.checked }))} 
                />
                <span className="text-slate-650 text-xs">Jadikan alamat utama</span>
              </label>

              <button type="submit" disabled={savingAddress} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all mt-4">
                {savingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAddress ? 'Simpan Perubahan' : '+ Tambah Alamat Baru'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
