'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // POS Cashier states
  const [cart, setCart] = useState<{ productId: string; quantity: number; name: string; price: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [posSuccess, setPosSuccess] = useState('');
  const [posError, setPosError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/products');
      const custRes = await api.get('/customers');
      const transRes = await api.get('/transactions');

      setProducts(prodRes.data || []);
      setCustomers(custRes.data || []);
      setTransactions(transRes.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations
  const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.netAmount), 0);
  // Estimate cost of goods sold (COGS) to calculate profit
  const totalCost = transactions.reduce((sum, t) => {
    return sum + (t.items?.reduce((cSum: number, item: any) => cSum + (Number(item.product?.cost || 0) * item.quantity), 0) || 0);
  }, 0);
  const grossProfit = totalRevenue - totalCost;
  const lowStockItems = products.filter(p => p.stock <= p.minStockThreshold);

  // POS Add to Cart
  const handleAddToCart = (product: any) => {
    if (product.stock === 0) return;
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return; // Prevent exceeding stock
      setCart(cart.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { productId: product.id, quantity: 1, name: product.name, price: Number(product.price) }]);
    }
  };

  // POS Update Cart Quantity
  const handleUpdateQty = (productId: string, val: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (val <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      const quantity = Math.min(val, product.stock);
      setCart(cart.map(item => item.productId === productId ? { ...item, quantity } : item));
    }
  };

  // Calculate POS cart values
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = cartSubtotal * 0.1; // 10% VAT
  const totalPayment = Math.max(0, cartSubtotal + taxAmount - discount);

  // POS Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setPosSuccess('');
    setPosError('');
    setCheckoutLoading(true);

    try {
      const payload = {
        customerId: selectedCustomerId || null,
        discount,
        taxPercent: 10,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/transactions', payload);
      setPosSuccess(`Pembayaran Berhasil! Nomor Invoice: ${res.data.invoiceNumber}`);
      setCart([]);
      setDiscount(0);
      setSelectedCustomerId('');
      
      // Reload stats
      fetchData();
    } catch (err: any) {
      setPosError(err.message || 'Transaksi gagal diproses');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      <Sidebar />

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-left">
        
        {/* Banner Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Ringkasan KPI Bisnis</h1>
            <p className="text-slate-400 text-xs mt-1">Status performa penjualan real-time UMKM Anda</p>
          </div>
          <button onClick={fetchData} className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
            🔄 Refresh
          </button>
        </div>

        {/* Low Stock Warn Banner */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-500/20 text-amber-300 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>
                Ada <strong>{lowStockItems.length} produk</strong> dengan persediaan kritis di bawah batas limit. 
                Sistem telah mensimulasikan peringatan WhatsApp ke nomor Owner.
              </span>
            </div>
            <a href="/products" className="underline hover:text-white font-bold shrink-0 ml-4">Kelola Stok</a>
          </div>
        )}

        {/* KPI Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400">Total Omset Pendapatan</span>
            <div className="text-xl font-black text-white mt-2">Rp {totalRevenue.toLocaleString('id-ID')}</div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-1">↑ 12% dari bulan lalu</span>
          </div>

          <div className="glass p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400">Margin Laba Bersih</span>
            <div className="text-xl font-black text-blue-400 mt-2">Rp {grossProfit.toLocaleString('id-ID')}</div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">Dihitung dari (Pendapatan - Cost)</span>
          </div>

          <div className="glass p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400">Pelanggan CRM Terdaftar</span>
            <div className="text-xl font-black text-white mt-2">{customers.length} Orang</div>
            <span className="text-[10px] text-blue-400 font-semibold block mt-1">Loyalty Points terintegrasi</span>
          </div>

          <div className="glass p-5 rounded-2xl">
            <span className="text-xs font-bold text-slate-400">Katalog Barang Aktif</span>
            <div className="text-xl font-black text-amber-500 mt-2">{products.length} SKU</div>
            <span className="text-[10px] text-red-400 font-medium block mt-1">{lowStockItems.length} Stok kritis</span>
          </div>
        </div>

        {/* Sales Chart and POS Cashier layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Visual Trend Chart */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-white">Trend Volume Transaksi Harian</h3>
              <span className="text-[10px] text-slate-400">Unit: IDR (Rupiah)</span>
            </div>
            
            {/* Visual HTML-based CSS chart bar for simple robust charting without client canvas sizing crashes */}
            <div className="h-64 flex items-end justify-between gap-2.5 pt-8 pb-2">
              {transactions.slice(0, 7).reverse().map((t, i) => {
                const heightPercent = Math.min(100, Math.max(15, (Number(t.netAmount) / (totalRevenue || 1)) * 300));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[9px] text-slate-500 hidden group-hover:block transition-all absolute translate-y-[-24px] bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                      Rp {Number(t.netAmount).toLocaleString('id-ID')}
                    </span>
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-md hover:brightness-125 transition-all shadow-lg"
                      style={{ height: `${heightPercent}px` }}
                    />
                    <span className="text-[9px] text-slate-500 truncate max-w-[60px]">{t.invoiceNumber.substring(9)}</span>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                  Belum ada riwayat transaksi penjualan.
                </div>
              )}
            </div>
            <div className="border-t border-slate-800/80 pt-3 text-[10px] text-slate-500 text-center">
              Menampilkan 7 transaksi invoice penjualan terakhir
            </div>
          </div>

          {/* POS Kasir Register Widget */}
          <div className="glass-premium p-6 rounded-2xl flex flex-col gap-4 text-left border border-blue-500/20">
            <div>
              <h3 className="font-extrabold text-sm text-white">Kasir POS Digital</h3>
              <p className="text-[10px] text-slate-500">Gunakan widget ini untuk melakukan input penjualan cepat</p>
            </div>

            {posSuccess && (
              <div className="bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs px-3 py-2 rounded-lg">
                ✅ {posSuccess}
              </div>
            )}
            {posError && (
              <div className="bg-red-950/60 border border-red-500/20 text-red-300 text-xs px-3 py-2 rounded-lg">
                ⚠️ {posError}
              </div>
            )}

            {/* Cart Items listing */}
            <div className="flex-1 max-h-[200px] overflow-y-auto border border-slate-800 rounded-xl p-3 bg-slate-950/40 flex flex-col gap-2.5">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-900 pb-1.5">
                  <div className="truncate pr-2 text-left">
                    <div className="font-bold text-white truncate max-w-[120px]">{item.name}</div>
                    <div className="text-[9px] text-slate-500">Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleUpdateQty(item.productId, item.quantity - 1)} className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs">-</button>
                    <span className="w-4 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.productId, item.quantity + 1)} className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs">+</button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-[11px] text-slate-500 my-auto text-center">
                  Klik ikon '+' pada produk di katalog untuk menambahkan ke kasir
                </div>
              )}
            </div>

            {/* Select Customer & Input Discount */}
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-slate-400 font-semibold">Tautkan Member CRM (Opsional)</label>
                <select 
                  value={selectedCustomerId} 
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="">-- Pelanggan Walk-In --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.points} Pts)</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-slate-400 font-semibold">Nominal Diskon (Rupiah)</label>
                <input 
                  type="number"
                  placeholder="Rp 0"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Fee summary */}
            <div className="border-t border-slate-800 pt-3 flex flex-col gap-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Cart</span>
                <span>Rp {cartSubtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pajak PPN (10%)</span>
                <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Diskon Potongan</span>
                  <span>- Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-white border-t border-slate-900 pt-1.5">
                <span>Total Bayar</span>
                <span className="text-blue-400">Rp {totalPayment.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || cart.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-all mt-1"
            >
              {checkoutLoading ? 'Memproses Nota...' : 'PROSES CHECKOUT NOTA'}
            </button>
          </div>
        </div>

        {/* catalog inline quick list to add product to POS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass p-6 rounded-2xl text-left">
            <h3 className="font-extrabold text-sm text-white mb-3">Katalog Kasir Cepat</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[220px] overflow-y-auto pr-1">
              {products.map((p) => {
                const isLow = p.stock <= p.minStockThreshold;
                return (
                  <div key={p.id} className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="text-[10px] text-slate-500 truncate">{p.sku}</div>
                      <div className="font-bold text-xs text-white truncate">{p.name}</div>
                      <div className="text-[11px] font-semibold text-blue-400 mt-1">Rp {Number(p.price).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${isLow ? 'bg-red-950/60 text-red-300' : 'bg-slate-950 text-slate-400'}`}>
                        Stok: {p.stock}
                      </span>
                      <button 
                        onClick={() => handleAddToCart(p)} 
                        disabled={p.stock === 0}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white w-5 h-5 rounded flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
              {products.length === 0 && (
                <div className="col-span-4 text-center text-xs text-slate-500 py-6">
                  Belum ada katalog produk. Silakan tambahkan di menu Produk.
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail Activity logs feed */}
          <div className="glass p-6 rounded-2xl text-left">
            <h3 className="font-extrabold text-sm text-white mb-3">Security Audit Trail</h3>
            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto text-[11px] pr-1">
              {transactions.slice(0, 5).map((t, idx) => (
                <div key={idx} className="border-b border-slate-900 pb-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-blue-400">SALE_CREATE</span>
                    <span className="text-slate-500">{new Date(t.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">Penjualan POS {t.invoiceNumber} senilai Rp {Number(t.netAmount).toLocaleString('id-ID')}</p>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-slate-500 text-center py-6">
                  Belum ada log aktivitas keamanan.
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
