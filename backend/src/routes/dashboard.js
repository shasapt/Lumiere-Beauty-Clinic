import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query, queryOne } from '../db.js';

const router = Router();

router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  const reservasiHariIni = queryOne(
    "SELECT COUNT(*) AS total FROM bookings WHERE user_id = ? AND tanggal_reservasi = ?",
    [userId, today]
  )?.total || 0;

  const reservasiDiproses = queryOne(
    "SELECT COUNT(*) AS total FROM bookings WHERE user_id = ? AND tanggal_reservasi = ? AND status IN ('baru','dikonfirmasi','sedang_treatment')",
    [userId, today]
  )?.total || 0;

  const reservasiSelesai = queryOne(
    "SELECT COUNT(*) AS total FROM bookings WHERE user_id = ? AND tanggal_reservasi = ? AND status = 'selesai'",
    [userId, today]
  )?.total || 0;

  const pendapatanHariIni = queryOne(
    "SELECT COALESCE(SUM(total_harga), 0) AS total FROM bookings WHERE user_id = ? AND tanggal_reservasi = ? AND status != 'dibatalkan'",
    [userId, today]
  )?.total || 0;

  const monthStart = today.slice(0, 7) + '-01';
  const pendapatanBulanIni = queryOne(
    "SELECT COALESCE(SUM(total_harga), 0) AS total FROM bookings WHERE user_id = ? AND tanggal_reservasi >= ? AND status != 'dibatalkan'",
    [userId, monthStart]
  )?.total || 0;

  const pasienAktif = queryOne(
    "SELECT COUNT(DISTINCT patient_id) AS total FROM bookings WHERE user_id = ?",
    [userId]
  )?.total || 0;

  const treatmentTerlaris = query(
    `SELECT t.nama_treatment, COUNT(bi.id) AS jumlah
     FROM booking_items bi
     JOIN treatments t ON t.id = bi.treatment_id
     JOIN bookings b ON b.id = bi.booking_id
     WHERE b.user_id = ? AND b.status != 'dibatalkan'
     GROUP BY t.id
     ORDER BY jumlah DESC
     LIMIT 5`,
    [userId]
  );

  const reservasiTerbaru = query(
    `SELECT b.id, b.jam_reservasi, b.status, p.nama_pasien,
            (SELECT GROUP_CONCAT(t2.nama_treatment, ', ')
             FROM booking_items bi2 JOIN treatments t2 ON t2.id = bi2.treatment_id
             WHERE bi2.booking_id = b.id) AS treatment
     FROM bookings b
     JOIN patients p ON p.id = b.patient_id
     WHERE b.user_id = ? AND b.tanggal_reservasi = ?
     ORDER BY b.jam_reservasi ASC
     LIMIT 5`,
    [userId, today]
  );

  res.json({
    reservasi_hari_ini: reservasiHariIni,
    reservasi_diproses: reservasiDiproses,
    reservasi_selesai: reservasiSelesai,
    pendapatan_hari_ini: pendapatanHariIni,
    pendapatan_bulan_ini: pendapatanBulanIni,
    pasien_aktif: pasienAktif,
    treatment_terlaris: treatmentTerlaris,
    reservasi_terbaru: reservasiTerbaru.map((r) => ({
      pasien: r.nama_pasien,
      treatment: r.treatment || '-',
      jam: r.jam_reservasi,
      status: r.status,
    })),
  });
});

export default router;
