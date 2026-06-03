'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Minuman');
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(5);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const user = api.getUser();
    if (user) {
      setUserRole(user.role);
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSubmitLoading(true);

    try {
      const payload = {
        name,
        sku,
        category,
        price,
        cost,
        stock,
        minStockThreshold: minStock,
      };

      await api.post('/products', payload);
      setSuccessMsg('Produk baru berhasil ditambahkan ke katalog!');
      
      // Reset form
      setName('');
      setSku('');
      setPrice(0);
      setCost(0);
      setStock(0);
      setMinStock(5);

      fetchProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan produk');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleQuickAddStock = async (productId: string, currentStock: number) => {
    try {
      await api.put(`/products/${productId}`, {
        stock: currentStock + 10,
      });
      fetchProducts();
    } catch (err) {
      console.error('Failed to quick increment stock:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-left">
        <div>
          <h1 className="text-2xl font-black text-white">Manajemen Produk & Stok</h1>
          <p className="text-slate-400 text-xs mt-1">Kelola katalog harga jual, estimasi margin modal, serta limit aman inventori</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Table list */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white">Daftar SKU Aktif ({products.length} Item)</h3>
              <button onClick={fetchProducts} className="text-xs text-blue-400 font-bold hover:underline">Reload</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold text-left">
                    <th className="pb-3">SKU / Nama Produk</th>
                    <th className="pb-3">Kategori</th>
                    <th className="pb-3 text-right">Harga Jual</th>
                    <th className="pb-3 text-right">Stok</th>
                    <th className="pb-3 text-center">Status Limit</th>
                    {userRole !== 'STAFF' && <th className="pb-3 text-center">Aksi Cepat</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isLow = p.stock <= p.minStockThreshold;
                    return (
                      <tr key={p.id} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                        <td className="py-3">
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-500">{p.sku}</div>
                        </td>
                        <td className="py-3 text-slate-400">{p.category}</td>
                        <td className="py-3 text-right font-semibold text-blue-400">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                        <td className="py-3 text-right font-bold text-white">{p.stock}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            isLow ? 'bg-red-950/60 text-red-300 border border-red-500/20' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {isLow ? 'Stok Tipis' : 'Aman'}
                          </span>
                        </td>
                        {userRole !== 'STAFF' && (
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleQuickAddStock(p.id, p.stock)}
                              className="px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] rounded hover:bg-blue-900/10 hover:text-blue-400 transition-colors"
                            >
                              +10 Restock
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Katalog produk kosong.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add product form panel */}
          {userRole !== 'STAFF' ? (
            <div className="glass p-6 rounded-2xl flex flex-col gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-white">Tambah Produk Baru</h3>
                <p className="text-[10px] text-slate-500">Masukkan parameter detail produk inventori baru</p>
              </div>

              {successMsg && (
                <div className="bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-xs px-3 py-2 rounded-lg">
                  ✅ {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="bg-red-950/60 border border-red-500/20 text-red-300 text-xs px-3 py-2 rounded-lg">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Nama Barang</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Roti Bakar Coklat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Kode SKU Produk</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RT-BK-03"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400">Kategori Katalog</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Retail">Retail</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">Harga Jual (Rp)</label>
                    <input
                      type="number"
                      required
                      placeholder="15000"
                      value={price === 0 ? '' : price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">Modal/Cost (Rp)</label>
                    <input
                      type="number"
                      required
                      placeholder="7000"
                      value={cost === 0 ? '' : cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">Stok Awal</label>
                    <input
                      type="number"
                      required
                      placeholder="20"
                      value={stock === 0 ? '' : stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400">Limit Stok Minim</label>
                    <input
                      type="number"
                      required
                      placeholder="5"
                      value={minStock === 0 ? '' : minStock}
                      onChange={(e) => setMinStock(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition-colors mt-2"
                >
                  {submitLoading ? 'Menyimpan...' : 'SIMPAN PRODUK BARU'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass p-6 rounded-2xl text-slate-400 text-xs text-center py-12">
              Akun Staff Anda tidak memiliki hak akses (RBAC) untuk mengedit atau menambahkan katalog produk.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
