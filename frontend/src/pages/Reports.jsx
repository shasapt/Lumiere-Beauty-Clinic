import { useState, useEffect } from 'react';
import { api } from '../api.js';
import BottomNav from '../components/BottomNav.jsx';

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    setLoading(true);
    try {
      const data = await api('/reports/dashboard');
      setSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadPeriod() {
    if (!startDate || !endDate) return;
    setPeriodLoading(true);
    try {
      const data = await api(`/reports/period?start_date=${startDate}&end_date=${endDate}`);
      setPeriodData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPeriodLoading(false);
    }
  }

  function handlePeriodSubmit(e) {
    e.preventDefault();
    loadPeriod();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-text">Laporan</h1>
        </header>
        <main className="px-4 py-6 max-w-lg mx-auto">
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-text">Laporan</h1>
      </header>

      <div className="px-4 py-3 bg-white border-b border-gray-100 sticky top-[57px] z-10">
        <div className="flex gap-2 max-w-lg mx-auto">
          <button onClick={() => setActiveTab('summary')} className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'summary' ? 'bg-primary text-white' : 'bg-card text-secondary'}`}>
            Ringkasan
          </button>
          <button onClick={() => setActiveTab('period')} className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'period' ? 'bg-primary text-white' : 'bg-card text-secondary'}`}>
            Periode
          </button>
        </div>
      </div>

      <main className="px-4 py-4 max-w-lg mx-auto pb-24">
        {activeTab === 'summary' && summary && (
          <>
            <section className="mb-5">
              <h2 className="text-sm font-semibold text-text mb-3">Ringkasan Usaha</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">💰</span>
                    <span className="text-xs text-secondary">Total Pendapatan</span>
                  </div>
                  <p className="text-lg font-semibold text-text">{rupiah(summary.total_pendapatan)}</p>
                </div>
                <div className="bg-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📋</span>
                    <span className="text-xs text-secondary">Total Transaksi</span>
                  </div>
                  <p className="text-lg font-semibold text-text">{summary.total_transaksi}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📅</span>
                    <span className="text-xs text-secondary">Total Reservasi</span>
                  </div>
                  <p className="text-lg font-semibold text-text">{summary.total_reservasi}</p>
                </div>
                <div className="bg-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">👥</span>
                    <span className="text-xs text-secondary">Pasien Aktif</span>
                  </div>
                  <p className="text-lg font-semibold text-text">{summary.total_pasien}</p>
                </div>
              </div>
            </section>

            {summary.treatment_terlaris && summary.treatment_terlaris.length > 0 && (
              <section className="mb-5">
                <h2 className="text-sm font-semibold text-text mb-3">Treatment Terlaris</h2>
                <div className="bg-card rounded-xl p-4 space-y-3">
                  {summary.treatment_terlaris.map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium text-primary">{i + 1}</span>
                        <span className="text-sm text-text">{t.nama_treatment}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-text">{t.jumlah}x</p>
                        <p className="text-xs text-secondary">{rupiah(t.pendapatan || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === 'period' && (
          <>
            <form onSubmit={handlePeriodSubmit} className="bg-card rounded-xl p-4 mb-5 space-y-3">
              <h2 className="text-sm font-semibold text-text mb-2">Filter Periode</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-secondary mb-1">Tanggal Mulai</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary" max={endDate || today} />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-1">Tanggal Selesai</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary" min={startDate || monthStart} max={today} />
                </div>
              </div>
              <button type="submit" disabled={periodLoading} className="w-full bg-primary text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-60 min-h-[44px]">
                {periodLoading ? 'Memuat...' : 'Tampilkan Laporan'}
              </button>
            </form>

            {periodData && (
              <>
                <section className="mb-5">
                  <h2 className="text-sm font-semibold text-text mb-3">Pendapatan per Hari</h2>
                  <div className="bg-card rounded-xl p-4">
                    {periodData.pendapatan_per_hari.length > 0 ? (
                      <div className="space-y-2">
                        {periodData.pendapatan_per_hari.map((d, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <span className="text-sm text-text">{formatDate(d.tanggal_reservasi)}</span>
                            <div className="text-right">
                              <p className="text-sm font-medium text-text">{rupiah(d.pendapatan)}</p>
                              <p className="text-xs text-secondary">{d.jumlah_reservasi} reservasi</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-secondary py-4">Tidak ada data pada periode ini</p>
                    )}
                  </div>
                </section>

                <section className="mb-5">
                  <h2 className="text-sm font-semibold text-text mb-3">Treatment pada Periode</h2>
                  <div className="bg-card rounded-xl p-4 space-y-3">
                    {periodData.treatment_periode.length > 0 ? (
                      periodData.treatment_periode.map((t, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                          <span className="text-sm text-text">{t.nama_treatment}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium text-text">{t.jumlah}x</p>
                            <p className="text-xs text-secondary">{rupiah(t.pendapatan || 0)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-secondary py-4">Tidak ada data treatment</p>
                    )}
                  </div>
                </section>

                <section>
                  <h2 className="text-sm font-semibold text-text mb-3">Status Reservasi</h2>
                  <div className="bg-card rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {periodData.status_breakdown.map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-text capitalize">{s.status}</span>
                          <span className="text-sm font-medium text-primary">{s.jumlah}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}