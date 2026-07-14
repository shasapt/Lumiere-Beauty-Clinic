import { useState, useEffect } from 'react';
import { api } from '../api.js';
import BottomNav from '../components/BottomNav.jsx';

const KATEGORI = ['Facial', 'Chemical Peeling', 'Laser Treatment', 'Acne Treatment', 'Whitening Treatment', 'Botox & Filler', 'Skin Booster'];

const emptyForm = { nama_treatment: '', kategori: '', harga: '', durasi: '60', deskripsi_singkat: '' };

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadTreatments(); }, []);

  async function loadTreatments(kategori) {
    try {
      const params = kategori ? `?kategori=${encodeURIComponent(kategori)}` : '';
      const data = await api(`/treatments${params}`);
      setTreatments(data);
    } catch {}
    finally { setLoading(false); }
  }

  function handleFilter(k) {
    setFilter(k);
    setLoading(true);
    loadTreatments(k);
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function openEdit(t) {
    setEditId(t.id);
    setForm({
      nama_treatment: t.nama_treatment,
      kategori: t.kategori,
      harga: String(t.harga),
      durasi: String(t.durasi),
      deskripsi_singkat: t.deskripsi_singkat || '',
    });
    setError('');
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    if (!form.nama_treatment.trim() || !form.kategori) {
      setError('Nama treatment dan kategori wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, harga: parseInt(form.harga) || 0, durasi: parseInt(form.durasi) || 60 };
      if (editId) {
        await api(`/treatments/${editId}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await api('/treatments', { method: 'POST', body: JSON.stringify(body) });
      }
      setShowForm(false);
      loadTreatments(filter);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus treatment ini?')) return;
    try {
      await api(`/treatments/${id}`, { method: 'DELETE' });
      loadTreatments(filter);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-text">Treatment</h1>
        <button onClick={openAdd} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium min-h-[44px]">
          + Tambah
        </button>
      </header>

      <div className="px-4 py-3 overflow-x-auto sticky top-[57px] bg-bg z-10">
        <div className="flex gap-2 max-w-lg mx-auto pb-1">
          <button onClick={() => handleFilter('')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[36px] ${!filter ? 'bg-primary text-white' : 'bg-card text-secondary'}`}>
            Semua
          </button>
          {KATEGORI.map((k) => (
            <button key={k} onClick={() => handleFilter(k)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[36px] ${filter === k ? 'bg-primary text-white' : 'bg-card text-secondary'}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-2 max-w-lg mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : treatments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary">{filter ? `Tidak ada treatment kategori "${filter}"` : 'Belum ada treatment'}</p>
            <button onClick={openAdd} className="mt-3 text-primary text-sm font-medium">Tambah treatment</button>
          </div>
        ) : (
          <div className="space-y-3">
            {treatments.map((t) => (
              <div key={t.id} className="bg-card rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text">{t.nama_treatment}</p>
                      <span className="text-[11px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">{t.kategori}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-secondary">
                      <span>{rupiah(t.harga)}</span>
                      <span>{t.durasi} menit</span>
                    </div>
                    {t.deskripsi_singkat && (
                      <p className="text-xs text-secondary mt-1 line-clamp-2">{t.deskripsi_singkat}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => openEdit(t)} className="text-xs text-primary font-medium px-2 py-1">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-xs text-red-500 font-medium px-2 py-1">Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-text">{editId ? 'Edit Treatment' : 'Tambah Treatment'}</h2>
              <button onClick={() => setShowForm(false)} className="text-secondary text-lg">&times;</button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
            )}
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="block text-sm text-text mb-1">Nama Treatment *</label>
                <input value={form.nama_treatment} onChange={(e) => setForm({...form, nama_treatment: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-text mb-1">Kategori *</label>
                <select value={form.kategori} onChange={(e) => setForm({...form, kategori: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Pilih kategori</option>
                  {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-text mb-1">Harga (Rp)</label>
                  <input type="number" value={form.harga} onChange={(e) => setForm({...form, harga: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm text-text mb-1">Durasi (menit)</label>
                  <input type="number" value={form.durasi} onChange={(e) => setForm({...form, durasi: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm text-text mb-1">Deskripsi</label>
                <textarea value={form.deskripsi_singkat} onChange={(e) => setForm({...form, deskripsi_singkat: e.target.value})} rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-primary text-white font-medium py-3 rounded-lg text-base hover:bg-primary-dark transition-colors disabled:opacity-60 min-h-[44px]">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
