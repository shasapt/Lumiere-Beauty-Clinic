import { useState, useEffect } from 'react';
import { api, setToken } from '../api.js';
import BottomNav from '../components/BottomNav.jsx';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await api('/auth/me');
      setUser(data.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Semua field wajib diisi');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setSaving(true);
    try {
      await api('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      setSuccess('Password berhasil diubah');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setToken(null);
    window.location.href = '/auth/login';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-text">Profil</h1>
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
        <h1 className="text-lg font-semibold text-text">Profil</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto pb-24">
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-text">{user?.nama_klinik || 'Klinik'}</h2>
              <p className="text-sm text-secondary">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-secondary">Username</span>
              <span className="font-medium text-text">{user?.username}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-secondary">Email</span>
              <span className="font-medium text-text">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-secondary">Bergabung</span>
              <span className="font-medium text-text">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-text mb-4">Ganti Password</h2>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full bg-gray-100 text-text font-medium py-3 rounded-lg mb-4 flex items-center justify-between"
          >
            <span>{showPasswordForm ? 'Tutup Form' : 'Ganti Password'}</span>
            <svg className={`w-5 h-5 text-secondary transition-transform ${showPasswordForm ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
              {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">{success}</div>}
              <div>
                <label className="block text-sm text-text mb-1">Password Saat Ini *</label>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm text-text mb-1">Password Baru *</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm text-text mb-1">Konfirmasi Password Baru *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white font-medium py-3 rounded-lg text-base hover:bg-primary-dark transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {saving ? 'Menyimpan...' : 'Simpan Password'}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 border border-red-200 font-medium py-3 rounded-lg text-base hover:bg-red-100 transition-colors min-h-[44px]"
          >
            Keluar
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}