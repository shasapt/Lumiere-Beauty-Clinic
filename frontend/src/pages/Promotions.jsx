import { useState, useEffect } from 'react';
import { api } from '../api.js';
import BottomNav from '../components/BottomNav.jsx';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_COLOR = {
  aktif: 'bg-green-100 text-green-700',
  'tidak aktif': 'bg-gray-100 text-gray-600'
};

const STATUS_LABEL = {
  aktif: 'Aktif',
  'tidak aktif': 'Tidak Aktif'
};

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status: 'tidak aktif'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadPromotions(); }, []);

  async function loadPromotions() {
    try {
      const data = await api('/promotions');
      setPromotions(data);
    } catch {}
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditId(null);
    setForm({ judul: '', deskripsi: '', tanggal_mulai: '', tanggal_selesai: '', status: 'tidak aktif' });
    setError('');
    setShowForm(true);
  }

  function openEdit(p) {
    setEditId(p.id);
    setForm({
      judul: p.judul,
      deskripsi: p.deskripsi || '',
      tanggal_mulai: p.tanggal_mulai,
      tanggal_selesai: p.tanggal_selesai,
      status: p.status
    });
    setError('');
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    if (!form.judul.trim() || !form.tanggal_mulai || !form.tanggal_selesai) {
      setError('Judul, tanggal mulai, dan tanggal selesai wajib diisi');
      return;
    }
    if (new Date(form.tanggal_mulai) > new Date(form.tanggal_selesai)) {
      setError('Tanggal mulai tidak boleh setelah tanggal selesai');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api(`/promotions/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/promotions', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowForm(false);
      loadPromotions();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus promo ini?')) return;
    try {
      await api(`/promotions/${id}`, { method: 'DELETE' });
      loadPromotions();
    } catch {}
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-text">Promo</h1>
        <button onClick={openAdd} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium min-h-[44px]">
          + Tambah
        </button>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary">Belum ada promo</p>
            <button onClick={openAdd} className="mt-3 text-primary text-sm font-medium">Buat promo pertama</button>
          </div>
        ) : (
          <div className="space-y-3">
            {promotions.map((p) => (
              <div key={p.id} className="bg-card rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-text">{p.judul}</p>
                    <p className="text-xs text-secondary mt-0.5 line-clamp-2">{p.deskripsi || '-'}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-secondary mb-2">
                  <span>Mulai: {formatDate(p.tanggal_mulai)}</span>
                  <span>Selesai: {formatDate(p.tanggal_selesai)}</span>
                  <span className={p.status === 'aktif' && new Date(p.tanggal_selesai) >= new Date(today) ? 'text-green-600 font-medium' : ''}>
                    {p.status === 'aktif' && new Date(p.tanggal_selesai) >= new Date(today) ? '🟢 Berjalan' : ''}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-xs text-primary font-medium px-2 py-1">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 font-medium px-2 py-1">Hapus</button>
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
              <h2 className="font-semibold text-text">{editId ? 'Edit Promo' : 'Tambah Promo'}</h2>
              <button onClick={() => setShowForm(false)} className="text-secondary text-lg">&times;</button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="block text-sm text-text mb-1">Judul *</label>
                <input value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-text mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({...form, deskripsi: e.target.value})} rows={2}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-text mb-1">Tanggal Mulai *</label>
                  <input type="date" value={form.tanggal_mulai} onChange={(e) => setForm({...form, tanggal_mulai: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm text-text mb-1">Tanggal Selesai *</label>
                  <input type="date" value={form.tanggal_selesai} onChange={(e) => setForm({...form, tanggal_selesai: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm text-text mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="aktif">Aktif</option>
                  <option value="tidak aktif">Tidak Aktif</option>
                </select>
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