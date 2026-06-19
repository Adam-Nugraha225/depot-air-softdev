'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { orderAPI } from '@/lib/api';
import { Landmark, CreditCard, DollarSign, ShieldCheck, Check, X, Loader2, ChevronRight, ArrowRight } from 'lucide-react';

interface VendorData {
  id: string;
  name: string;
  rating: number;
  mainLocation: string;
  pricePerLiter: number;
  volume: number;
  totalPrice: number;
}

export default function BuyerPayment() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'VIRTUAL_ACCOUNT' | 'COD'>('VIRTUAL_ACCOUNT');
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'MANDIRI' | 'BNI'>('BCA');
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  useEffect(() => {
    const dataStr = sessionStorage.getItem('selectedVendor');
    if (dataStr) {
      setVendorData(JSON.parse(dataStr));
    } else {
      // Fallback or redirect if no vendor selected
      router.push('/buyer/dashboard');
    }
  }, [router]);

  const handlePay = async () => {
    if (!vendorData) return;
    setPaying(true);
    try {
      const paymentMethodLabel = paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' :
                                   paymentMethod === 'COD' ? 'Cash On Delivery (COD)' :
                                   `Virtual Account ${selectedBank}`;
      const res = await orderAPI.createOrder({
        vendorId: vendorData.id,
        volume: vendorData.volume,
        paymentMethod: paymentMethodLabel,
        serviceFee: 0,
      });
      
      const createdOrder = res.data.data;
      setOrderNumber(createdOrder.orderNumber || 'VH-88291');
      
      const date = new Date();
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + `, ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
      setPaymentDate(formattedDate);
      
      setSuccess(true);
      sessionStorage.removeItem('selectedVendor');
      showToast('Pembayaran berhasil! Pesanan Anda segera diproses.', 'success');
    } catch (err) {
      showToast('Gagal memproses pembayaran. Coba lagi.', 'error');
    } finally {
      setPaying(false);
    }
  };

  if (!vendorData) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const subtotal = vendorData.totalPrice - 50000;
  const biayaLayanan = 50000;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-slate-800">Selesaikan Pembayaran Anda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Payment Methods */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pilih Metode Pembayaran</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pilih cara pembayaran yang Anda inginkan untuk melunasi tagihan.</p>
            </div>

            {/* Methods list */}
            <div className="space-y-4">
              {/* Bank Transfer */}
              <div 
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                  paymentMethod === 'BANK_TRANSFER' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Transfer Bank</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">Transfer langsung ke rekening korporat kami. Memerlukan verifikasi manual.</p>
                  </div>
                </div>
                <div className="pt-1">
                  <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'BANK_TRANSFER' ? 'border-primary-500 bg-primary-500' : 'border-slate-300 bg-white'
                  }`}>
                    {paymentMethod === 'BANK_TRANSFER' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>

              {/* Virtual Account */}
              <div 
                onClick={() => setPaymentMethod('VIRTUAL_ACCOUNT')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-4 ${
                  paymentMethod === 'VIRTUAL_ACCOUNT' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Virtual Account</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">Verifikasi otomatis dalam 5-10 menit. Bank yang tersedia:</p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'VIRTUAL_ACCOUNT' ? 'border-primary-500 bg-primary-500' : 'border-slate-300 bg-white'
                    }`}>
                      {paymentMethod === 'VIRTUAL_ACCOUNT' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Bank options */}
                {paymentMethod === 'VIRTUAL_ACCOUNT' && (
                  <div className="flex gap-3 pl-14 pb-1">
                    {(['BCA', 'MANDIRI', 'BNI'] as const).map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedBank(bank); }}
                        className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all ${
                          selectedBank === bank
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {bank} <span className="text-[10px] font-normal opacity-70">PILIH</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cash on Delivery */}
              <div 
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                  paymentMethod === 'COD' ? 'border-primary-500 bg-primary-50/20' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Cash On Delivery (COD)</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">Metode pembayaran belanjaan yang dilakukan secara tunai langsung kepada kurir saat barang sampai di alamat tujuan.</p>
                  </div>
                </div>
                <div className="pt-1">
                  <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'COD' ? 'border-primary-500 bg-primary-500' : 'border-slate-300 bg-white'
                  }`}>
                    {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Order Summary Card */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Ringkasan Pesanan</h3>

            {/* Vendor info snippet */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200">
                <img src="/images/water_truck.png" alt={vendorData.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[9px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded mb-0.5">VENDOR</span>
                <h4 className="font-bold text-slate-850 text-xs truncate">{vendorData.name}</h4>
                <p className="text-[10px] text-slate-500">Air Bersih 8kL</p>
              </div>
            </div>

            {/* Details cost */}
            <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Jumlah</span>
                <span className="font-semibold text-slate-800">{vendorData.volume.toLocaleString()} Liter</span>
              </div>
              <div className="flex justify-between">
                <span>Harga Satuan</span>
                <span className="font-semibold text-slate-800">Rp {vendorData.pricePerLiter.toLocaleString()} / L</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan</span>
                <span className="font-semibold text-slate-800">Rp 0</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-800">Total Tagihan</span>
                <span className="font-bold text-primary-650 text-sm">Rp {vendorData.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-md transition-all mt-2 disabled:opacity-50"
            >
              {paying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Bayar Sekarang <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pembayaran aman terenkripsi SSL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Receipt (Frame 3) */}
      {success && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md relative p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
                <Check className="w-7 h-7 text-primary-600 stroke-[3]" />
              </div>
              <h3 className="text-lg font-bold text-slate-850 mb-0.5">Pembayaran Berhasil</h3>
              <p className="text-xs text-slate-500">Terima kasih! Pesanan Anda Segera Diproses</p>
            </div>

            {/* Receipt specs */}
            <div className="space-y-3.5 border-t border-b border-dashed border-slate-200 py-4 text-xs text-slate-650 mb-5">
              <div className="flex justify-between">
                <span>ID PESANAN</span>
                <span className="font-bold text-slate-800">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>TANGGAL</span>
                <span className="font-medium text-slate-800">{paymentDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>METODE PEMBAYARAN</span>
                <span className="font-medium text-slate-800">
                  {paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' :
                   paymentMethod === 'COD' ? 'Cash On Delivery' :
                   `Virtual Account ${selectedBank}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>STATUS</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[10px]">LUNAS</span>
              </div>
            </div>

            {/* Receipt Summary details */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3 mb-6 text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ringkasan Pesanan</p>
              
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Air Bersih 8.000 Liter</span>
                <span className="font-semibold text-slate-800">Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mata Air Gunung Papandayan</span>
                <span className="text-slate-400">({vendorData.mainLocation})</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2.5">
                <span className="text-slate-600">Subtotal Produk</span>
                <span className="font-semibold text-slate-800">Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Biaya Layanan</span>
                <span className="font-semibold text-slate-800">Rp {biayaLayanan.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-150 pt-2.5 text-sm font-bold">
                <span className="text-slate-800">TOTAL PEMBAYARAN</span>
                <span className="text-primary-600">Rp {vendorData.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 mb-6">Simpan struk ini sebagai bukti pembayaran</p>

            <button 
              onClick={() => router.push('/buyer/tracking')}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all text-center block"
            >
              Lacak Pesanan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
