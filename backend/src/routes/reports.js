import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = Router();

router.use(authenticateToken);

router.get('/dashboard', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';

  const totalTransaksi = queryOne(
    'SELECT COUNT(*) AS total FROM bookings WHERE user_id = ? AND status != ?',
    [userId, 'dibatalkan']
  )?.total || 0;

  const totalPendapatan = queryOne(
    'SELECT COALESCE(SUM(total_harga), 0) AS total FROM bookings WHERE user_id = ? AND status != ?',
    [userId, 'dibatalkan']
  )?.total || 0;

  const totalReservasi = queryOne(
    'SELECT COUNT(*) AS total FROM bookings WHERE user_id = ?',
    [userId]
  )?.total || 0;

  const totalPasien = queryOne(
    'SELECT COUNT(*) AS total FROM patients WHERE user_id = ?',
    [userId]
  )?.total || 0;

  const treatmentTerlaris = query(
    `SELECT t.nama_treatment, COUNT(bi.id) AS jumlah, SUM(bi.subtotal) AS pendapatan
     FROM booking_items bi
     JOIN treatments t ON t.id = bi.treatment_id
     JOIN bookings b ON b.id = bi.booking_id
     WHERE b.user_id = ? AND b.status != ?
     GROUP BY t.id
     ORDER BY jumlah DESC
     LIMIT 5`,
    [userId, 'dibatalkan']
  );

  res.json({
    total_transaksi: totalTransaksi,
    total_pendapatan: totalPendapatan,
    total_reservasi: totalReservasi,
    total_pasien: totalPasien,
    treatment_terlaris: treatmentTerlaris,
  });
});

router.get('/period', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'start_date dan end_date wajib diisi' });
  }

  const pendapatanPerHari = query(
    `SELECT tanggal_reservasi, COALESCE(SUM(total_harga), 0) AS pendapatan, COUNT(*) AS jumlah_reservasi
     FROM bookings
     WHERE user_id = ? AND tanggal_reservasi >= ? AND tanggal_reservasi <= ? AND status != ?
     GROUP BY tanggal_reservasi
     ORDER BY tanggal_reservasi ASC`,
    [userId, start_date, end_date, 'dibatalkan']
  );

  const treatmentPeriode = query(
    `SELECT t.nama_treatment, COUNT(bi.id) AS jumlah, SUM(bi.subtotal) AS pendapatan
     FROM booking_items bi
     JOIN treatments t ON t.id = bi.treatment_id
     JOIN bookings b ON b.id = bi.booking_id
     WHERE b.user_id = ? AND b.tanggal_reservasi >= ? AND b.tanggal_reservasi <= ? AND b.status != ?
     GROUP BY t.id
     ORDER BY jumlah DESC`,
    [userId, start_date, end_date, 'dibatalkan']
  );

  const statusBreakdown = query(
    `SELECT status, COUNT(*) AS jumlah
     FROM bookings
     WHERE user_id = ? AND tanggal_reservasi >= ? AND tanggal_reservasi <= ?
     GROUP BY status`,
    [userId, start_date, end_date]
  );

  res.json({
    pendapatan_per_hari: pendapatanPerHari,
    treatment_periode: treatmentPeriode,
    status_breakdown: statusBreakdown,
  });
});

export default router;