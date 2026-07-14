import { useState, useEffect } from 'react';
import { api } from '../api.js';
import BottomNav from '../components/BottomNav.jsx';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDetail, setShowDetail] = useState(null);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const data = await api('/treatment-history');
      setHistory(data);
    } catch {}
    finally { setLoading(false); }
  }

  function openDetail(item) {
    setShowDetail(item);
  }

  async function loadDetail(id) {
    try {
      const data = await api(`/treatment-history/${id}`);
      setShowDetail(data);
    } catch {}
  }

  const filteredHistory = history.filter((h) => {
    const matchesSearch = h.nama_pasien?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFilter || h.tanggal_treatment?.startsWith(dateFilter);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-text">Riwayat Treatment</h1>
      </header>

      <div className="px-4 py-3 bg-white border-b border-gray-100 sticky top-[57px] z-10">
        <div className="space-y-3 max-w-lg mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama pasien..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2">
            <label className="flex-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="px-4 py-3 rounded-lg bg-gray-100 text-secondary text-sm font-medium min-h-[44px]"
              >
                Hapus Filter
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="px-4 py-4 max-w-lg mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary">Belum ada riwayat treatment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((h) => (
              <div key={h.id} onClick={() => { loadDetail(h.id); openDetail(h); }} className="bg-card rounded-xl p-4 cursor-pointer active:opacity-80">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-text">{h.nama_pasien}</p>
                    <p className="text-xs text-secondary mt-0.5">{h.no_whatsapp}</p>
                    <div className="flex gap-3 mt-1 text-xs text-secondary">
                      <span>{formatDate(h.tanggal_treatment)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-text font-medium">{h.treatment_yang_dilakukan}</p>
                  {h.keluhan_pasien && (
                    <p className="text-xs text-secondary mt-1 line-clamp-1">Keluhan: {h.keluhan_pasien}</p>
                  )}
                  {h.catatan_hasil && (
                    <p className="text-xs text-secondary mt-1 line-clamp-1">Catatan: {h.catatan_hasil}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showDetail && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-end sm:items-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-text">Detail Riwayat Treatment</h2>
              <button onClick={() => setShowDetail(null)} className="text-secondary text-lg">&times;</button>
            </div>

            <div className="bg-card rounded-xl p-4 mb-4">
              <p className="font-medium text-text">{showDetail.nama_pasien}</p>
              <p className="text-xs text-secondary">{showDetail.no_whatsapp}</p>
              <div className="flex items-center gap-3 mt-2 text-sm text-secondary">
                <span>{formatDate(showDetail.tanggal_treatment)}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-text mb-2">Treatment yang Dilakukan</p>
              <p className="text-text">{showDetail.treatment_yang_dilakukan}</p>
            </div>

            {showDetail.keluhan_pasien && (
              <div className="mb-4">
                <p className="text-sm font-medium text-text mb-2">Keluhan Pasien</p>
                <p className="text-text bg-gray-50 rounded-lg p-3">{showDetail.keluhan_pasien}</p>
              </div>
            )}

            {showDetail.catatan_hasil && (
              <div className="mb-4">
                <p className="text-sm font-medium text-text mb-2">Catatan Hasil</p>
                <p className="text-text bg-gray-50 rounded-lg p-3">{showDetail.catatan_hasil}</p>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm font-medium text-text">Dibuat</span>
              <span className="text-sm text-secondary">{formatDate(showDetail.created_at)}</span>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}