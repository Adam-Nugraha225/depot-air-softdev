'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { userAPI, vendorAPI } from '@/lib/api';
import { Building2, CheckCircle2, Loader2, MapPin, Save, ShieldCheck, Tag, User, Wallet } from 'lucide-react';

export default function SellerSettings() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountSaved, setAccountSaved] = useState(false);

  const [specialty, setSpecialty] = useState('');
  const [mainLocation, setMainLocation] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [defaultCapacity, setDefaultCapacity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorSaved, setVendorSaved] = useState(false);

  useEffect(() => {
    if (!user) return;

    setName(user.name || '');
    setPhone(user.phone || '');
    setSpecialty(user.vendorProfile?.specialty || '');
    setMainLocation(user.vendorProfile?.mainLocation || '');
    setPricePerLiter(user.vendorProfile?.pricePerLiter ? String(user.vendorProfile.pricePerLiter) : '');
    setDefaultCapacity(user.vendorProfile?.defaultCapacity ? String(user.vendorProfile.defaultCapacity) : '');
    setImageUrl(user.vendorProfile?.imageUrl || '');
  }, [user]);

  const handleAccountSave = async (event: FormEvent) => {
    event.preventDefault();
    setAccountLoading(true);

    try {
      await userAPI.updateProfile({ name: name.trim(), phone: phone.trim() });
      await refreshProfile();
      setAccountSaved(true);
      showToast('Profil akun berhasil diperbarui.', 'success');
      setTimeout(() => setAccountSaved(false), 3000);
    } catch {
      showToast('Gagal menyimpan profil akun. Coba lagi.', 'error');
    } finally {
      setAccountLoading(false);
    }
  };

  const handleVendorProfileSave = async (event: FormEvent) => {
    event.preventDefault();

    const parsedPrice = Number(pricePerLiter);
    const parsedCapacity = Number(defaultCapacity);

    if (!specialty.trim() || !mainLocation.trim()) {
      showToast('Spesialisasi dan lokasi utama wajib diisi.', 'warning');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      showToast('Harga per liter harus lebih dari 0.', 'warning');
      return;
    }

    if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0) {
      showToast('Kapasitas default harus berupa angka bulat lebih dari 0.', 'warning');
      return;
    }

    setVendorLoading(true);
    try {
      await vendorAPI.updateProfile({
        specialty: specialty.trim(),
        mainLocation: mainLocation.trim(),
        pricePerLiter: parsedPrice,
        defaultCapacity: parsedCapacity,
        imageUrl: imageUrl.trim() || undefined,
      });
      await refreshProfile();
      setVendorSaved(true);
      showToast('Profil vendor berhasil diperbarui.', 'success');
      setTimeout(() => setVendorSaved(false), 3000);
    } catch {
      showToast('Gagal menyimpan profil vendor. Coba lagi.', 'error');
    } finally {
      setVendorLoading(false);
    }
  };

  const profileCompletion = user?.vendorProfile?.profileCompletion ?? 0;
  const verificationStatus = user?.vendorProfile?.verificationStatus || 'PENDING';
  const isVerified = verificationStatus === 'VERIFIED';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pengaturan Akun</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola identitas akun dan profil vendor yang dilihat pembeli.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-150 bg-white px-3 py-2 text-xs font-bold text-slate-650 self-start">
          <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-emerald-500' : 'text-amber-500'}`} />
          {isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-bold text-slate-450 uppercase tracking-wider mb-5">Profil Akun</h2>

        <form onSubmit={handleAccountSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Nama Pemilik</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
              <input type="text" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Email</label>
            <input type="email" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400 cursor-not-allowed focus:outline-none" value={user?.email || ''} disabled />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Nomor Telepon</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">ID Vendor</label>
            <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400 cursor-not-allowed focus:outline-none" value={user?.id || ''} disabled />
          </div>

          <div className="sm:col-span-2 mt-2">
            <button type="submit" disabled={accountLoading} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-70">
              {accountLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : accountSaved ? <><CheckCircle2 className="w-4 h-4" /> Tersimpan</> : <><Save className="w-4 h-4" /> Simpan Profil Akun</>}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-sm font-bold text-slate-450 uppercase tracking-wider">Profil Vendor</h2>
          <div className="min-w-40">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>Kelengkapan</span>
              <span>{profileCompletion}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
        </div>

        <form onSubmit={handleVendorProfileSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Spesialisasi</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
              <input type="text" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Contoh: Air bersih curah, suplai industri" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Lokasi Utama</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
              <input type="text" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Contoh: Cibiru, Bandung Timur" value={mainLocation} onChange={(e) => setMainLocation(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Harga per Liter</label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
              <input type="number" min="1" step="1" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="450" value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Kapasitas Default</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
              <input type="number" min="1" step="1" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="8000" value={defaultCapacity} onChange={(e) => setDefaultCapacity(e.target.value)} required />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">URL Gambar Air/Armada (Opsional)</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20" 
              placeholder="Contoh: https://images.unsplash.com/photo-1548858850-e37452d765fb atau biarkan kosong untuk gambar default" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)} 
            />
          </div>

          <div className="sm:col-span-2 mt-2">
            <button type="submit" disabled={vendorLoading} className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-70">
              {vendorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : vendorSaved ? <><CheckCircle2 className="w-4 h-4" /> Tersimpan</> : <><Save className="w-4 h-4" /> Simpan Profil Vendor</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}