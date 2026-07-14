import { useState, useEffect } from 'react';
import { api } from '../api.js';
import BottomNav from '../components/BottomNav.jsx';

const STATUS_LIST = ['baru', 'dikonfirmasi', 'sedang_treatment', 'selesai', 'dibatalkan'];
const STATUS_LABEL = { baru: 'Baru', dikonfirmasi: 'Dikonfirmasi', sedang_treatment: 'Treatment', selesai: 'Selesai', dibatalkan: 'Dibatalkan' };
const STATUS_COLOR = { baru: 'bg-blue-100 text-blue-700', dikonfirmasi: 'bg-yellow-100 text-yellow-700', sedang_treatment: 'bg-purple-100 text-purple-700', selesai: 'bg-green-100 text-green-700', dibatalkan: 'bg-gray-200 text-gray-600' };

function rupiah(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }
function today() { return new Date().toISOString().split('T')[0]; }

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [form, setForm] = useState({ patient_id: '', tanggal_reservasi: today(), jam_reservasi: '09:00', items: [{ treatment_id: '', jumlah: 1 }] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [tab]);

  async function load() {
    try {
      const params = tab ? `?status=${tab}` : '';
      const data = await api(`/bookings${params}`);
      setBookings(data);
    } catch {}
    finally { setLoading(false); }
  }

  async function openForm() {
    setError('');
    setForm({ patient_id: '', tanggal_reservasi: today(), jam_reservasi: '09:00', items: [{ treatment_id: '', jumlah: 1 }] });
    try {
      const [p, t] = await Promise.all([api('/patients'), api('/treatments')]);
      setPatients(p);
      setTreatments(t);
    } catch {}
    setShowForm(true);
  }

  function addItem() {
    setForm({ ...form, items: [...form.items, { treatment_id: '', jumlah: 1 }] });
  }

  function updateItem(idx, field, value) {
    const items = form.items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    setForm({ ...form, items });
  }

  function removeItem(idx) {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  }

  function calcTotal() {
    let total = 0;
    for (const item of form.items) {
      if (!item.treatment_id) continue;
      const t = treatments.find((tr) => String(tr.id) === String(item.treatment_id));
      if (t) total += t.harga * (parseInt(item.jumlah) || 1);
    }
    return total;
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    if (!form.patient_id) { setError('Pilih pasien'); return; }
    if (!form.tanggal_reservasi) { setError('Pilih tanggal'); return; }
    if (!form.jam_reservasi) { setError('Pilih jam'); return; }
    if (!form.items[0]?.treatment_id) { setError('Pilih minimal 1 treatment'); return; }

    setSaving(true);
    try {
      await api('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: parseInt(form.patient_id),
          tanggal_reservasi: form.tanggal_reservasi,
          jam_reservasi: form.jam_reservasi,
          items: form.items.map((item) => ({ treatment_id: parseInt(item.treatment_id), jumlah: parseInt(item.jumlah) || 1 })),
        }),
      });
      setShowForm(false);
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleStatus(id, status) {
    try {
      await api(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      setShowDetail(null);
      load();
    } catch {}
  }

  function openDetail(b) {
    setShowDetail(b);
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-text">Reservasi</h1>
        <button onClick={openForm} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium min-h-[44px]">
          + Baru
        </button>
      </header>

      <div className="px-4 overflow-x-auto sticky top-[57px] bg-bg z-10 border-b border-gray-100">
        <div className="flex gap-2 py-3 max-w-lg mx-auto">
          <button onClick={() => { setLoading(true); setTab(''); }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium min-h-[36px] ${!tab ? 'bg-primary text-white' : 'bg-card text-secondary'}`}>Semua</button>
          {STATUS_LIST.map((s) => (
            <button key={s} onClick={() => { setLoading(true); setTab(s); }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium min-h-[36px] ${tab === s ? 'bg-primary text-white' : 'bg-card text-secondary'}`}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 py-4 max-w-lg mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary">{tab ? `Tidak ada reservasi status "${STATUS_LABEL[tab]}"` : 'Belum ada reservasi'}</p>
            <button onClick={openForm} className="mt-3 text-primary text-sm font-medium">Buat reservasi baru</button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} onClick={() => openDetail(b)} className="bg-card rounded-xl p-4 cursor-pointer active:opacity-80">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-text">{b.nama_pasien}</p>
                    <p className="text-xs text-secondary">{b.tanggal_reservasi} &middot; {b.jam_reservasi}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[b.status]}`}>{STATUS_LABEL[b.status]}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">{b.items?.length} treatment</span>
                  <span className="font-medium text-text">{rupiah(b.total_harga)}</span>
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
              <h2 className="font-semibold text-text">Reservasi Baru</h2>
              <button onClick={() => setShowForm(false)} className="text-secondary text-lg">&times;</button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="block text-sm text-text mb-1">Pasien *</label>
                <select value={form.patient_id} onChange={(e) => setForm({...form, patient_id: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Pilih pasien</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.nama_pasien} ({p.no_whatsapp})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-text mb-1">Tanggal *</label>
                  <input type="date" value={form.tanggal_reservasi} onChange={(e) => setForm({...form, tanggal_reservasi: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm text-text mb-1">Jam *</label>
                  <input type="time" value={form.jam_reservasi} onChange={(e) => setForm({...form, jam_reservasi: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-text mb-1">Treatment *</label>
                  <button type="button" onClick={addItem} className="text-xs text-primary font-medium">+ Tambah treatment</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <select value={item.treatment_id} onChange={(e) => updateItem(idx, 'treatment_id', e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Pilih treatment</option>
                        {treatments.map((t) => <option key={t.id} value={t.id}>{t.nama_treatment} - {rupiah(t.harga)}</option>)}
                      </select>
                      <input type="number" min="1" value={item.jumlah} onChange={(e) => updateItem(idx, 'jumlah', e.target.value)}
                        className="w-16 px-2 py-3 rounded-lg border border-gray-200 bg-white text-text text-base text-center focus:outline-none focus:ring-2 focus:ring-primary" />
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-400 text-xl px-1 py-3">&times;</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 mb-4 border-t border-gray-100">
                <span className="text-sm text-text font-medium">Total</span>
                <span className="font-semibold text-text">{rupiah(calcTotal())}</span>
              </div>

              <button type="submit" disabled={saving}
                className="w-full bg-primary text-white font-medium py-3 rounded-lg text-base hover:bg-primary-dark transition-colors disabled:opacity-60 min-h-[44px]">
                {saving ? 'Menyimpan...' : 'Buat Reservasi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-text">Detail Reservasi</h2>
              <button onClick={() => setShowDetail(null)} className="text-secondary text-lg">&times;</button>
            </div>

            <div className="bg-card rounded-xl p-4 mb-4">
              <p className="font-medium text-text">{showDetail.nama_pasien}</p>
              <p className="text-xs text-secondary">{showDetail.no_whatsapp}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-secondary">
                <span>{showDetail.tanggal_reservasi}</span>
                <span>{showDetail.jam_reservasi}</span>
              </div>
              <div className="mt-2">
                <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[showDetail.status]}`}>
                  {STATUS_LABEL[showDetail.status]}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-text mb-2">Treatment</p>
              <div className="space-y-2">
                {showDetail.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-card rounded-lg px-4 py-2">
                    <div>
                      <p className="text-sm text-text">{item.nama_treatment}</p>
                      <p className="text-xs text-secondary">{item.jumlah}x {rupiah(item.harga_satuan)}</p>
                    </div>
                    <span className="text-sm font-medium text-text">{rupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-100 mb-4">
              <span className="text-sm font-medium text-text">Total</span>
              <span className="font-semibold text-text">{rupiah(showDetail.total_harga)}</span>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-text mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_LIST.map((s) => (
                  <button key={s} onClick={() => handleStatus(showDetail.id, s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium min-h-[40px] transition-colors ${
                      showDetail.status === s ? 'bg-primary text-white' : 'bg-card text-secondary hover:bg-gray-200'
                    }`}>
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
