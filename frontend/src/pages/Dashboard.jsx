import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav.jsx';

function rupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusLabel = {
    baru: 'Baru',
    dikonfirmasi: 'Dikonfirmasi',
    sedang_treatment: 'Treatment',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
  };

  const statusColor = {
    baru: 'bg-blue-100 text-blue-700',
    dikonfirmasi: 'bg-yellow-100 text-yellow-700',
    sedang_treatment: 'bg-purple-100 text-purple-700',
    selesai: 'bg-green-100 text-green-700',
    dibatalkan: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-semibold text-text">{user?.nama_klinik || 'Lumiere Beauty Clinic'}</h1>
          <p className="text-xs text-secondary">Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/profile')} className="text-xs text-secondary font-medium">Profil</button>
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium text-sm cursor-default">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>
      </header>

      <main className="px-4 py-5 max-w-lg mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <StatCard
                label="Reservasi Hari Ini"
                value={data.reservasi_hari_ini}
                icon="📅"
              />
              <StatCard
                label="Pendapatan Hari Ini"
                value={rupiah(data.pendapatan_hari_ini)}
                icon="💰"
              />
              <StatCard
                label="Diproses"
                value={data.reservasi_diproses}
                icon="⏳"
              />
              <StatCard
                label="Selesai"
                value={data.reservasi_selesai}
                icon="✅"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <StatCard
                label="Pendapatan Bulan Ini"
                value={rupiah(data.pendapatan_bulan_ini)}
                icon="📊"
              />
              <StatCard
                label="Pasien Aktif"
                value={data.pasien_aktif}
                icon="👤"
              />
            </div>

            {data.reservasi_terbaru && (
              <section className="mb-5">
                <h2 className="text-sm font-semibold text-text mb-3">Reservasi Terbaru</h2>
                <div className="space-y-2">
                  {data.reservasi_terbaru.map((r, i) => (
                    <div key={i} className="bg-card rounded-xl px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text">{r.pasien}</p>
                        <p className="text-xs text-secondary">{r.treatment} &middot; {r.jam}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[r.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabel[r.status] || r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.treatment_terlaris && (
              <section>
                <h2 className="text-sm font-semibold text-text mb-3">Treatment Terlaris</h2>
                <div className="bg-card rounded-xl p-4">
                  {data.treatment_terlaris.map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm text-text">{t.nama}</span>
                      <span className="text-sm font-medium text-primary">{t.jumlah}x</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <p className="text-center text-secondary py-12">Gagal memuat data dashboard</p>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-secondary">{label}</span>
      </div>
      <p className="text-lg font-semibold text-text">{value}</p>
    </div>
  );
}
