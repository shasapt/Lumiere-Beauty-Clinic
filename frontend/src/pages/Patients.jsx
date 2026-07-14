import { useState, useEffect } from 'react';
import { api } from '../api.js';
import BottomNav from '../components/BottomNav.jsx';

const emptyForm = { nama_pasien: '', no_whatsapp: '', tanggal_lahir: '', jenis_kelamin: '', alamat: '' };

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadPatients(); }, []);

  async function loadPatients() {
    try {
      const data = await api('/patients');
      setPatients(data);
    } catch {}
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  }

  function openEdit(p) {
    setEditId(p.id);
    setForm({
      nama_pasien: p.nama_pasien,
      no_whatsapp: p.no_whatsapp,
      tanggal_lahir: p.tanggal_lahir || '',
      jenis_kelamin: p.jenis_kelamin || '',
      alamat: p.alamat || '',
    });
    setError('');
    setShowForm(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    if (!form.nama_pasien.trim() || !form.no_whatsapp.trim()) {
      setError('Nama dan nomor WhatsApp wajib diisi');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api(`/patients/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/patients', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowForm(false);
      loadPatients();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus pasien ini?')) return;
    try {
      await api(`/patients/${id}`, { method: 'DELETE' });
      loadPatients();
    } catch {}
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const genderLabel = { L: 'Laki-laki', P: 'Perempuan' };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-text">Pasien</h1>
        <button onClick={openAdd} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium min-h-[44px]">
          + Tambah
        </button>
      </header>

      <main className="px-4 py-5 max-w-lg mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary">Belum ada pasien</p>
            <button onClick={openAdd} className="mt-3 text-primary text-sm font-medium">Tambah pasien pertama</button>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((p) => (
              <div key={p.id} className="bg-card rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-text">{p.nama_pasien}</p>
                    <p className="text-xs text-secondary mt-0.5">{p.no_whatsapp}</p>
                    <div className="flex gap-3 mt-1 text-xs text-secondary">
                      <span>{genderLabel[p.jenis_kelamin] || '-'}</span>
                      <span>{formatDate(p.tanggal_lahir)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="text-xs text-primary font-medium px-2 py-1">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 font-medium px-2 py-1">Hapus</button>
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
              <h2 className="font-semibold text-text">{editId ? 'Edit Pasien' : 'Tambah Pasien'}</h2>
              <button onClick={() => setShowForm(false)} className="text-secondary text-lg">&times;</button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
            )}
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="block text-sm text-text mb-1">Nama Pasien *</label>
                <input value={form.nama_pasien} onChange={(e) => setForm({...form, nama_pasien: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-text mb-1">No. WhatsApp *</label>
                <input value={form.no_whatsapp} onChange={(e) => setForm({...form, no_whatsapp: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-text mb-1">Tanggal Lahir</label>
                <input type="date" value={form.tanggal_lahir} onChange={(e) => setForm({...form, tanggal_lahir: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-text mb-1">Jenis Kelamin</label>
                <select value={form.jenis_kelamin} onChange={(e) => setForm({...form, jenis_kelamin: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Pilih</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm text-text mb-1">Alamat</label>
                <textarea value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} rows={2}
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
