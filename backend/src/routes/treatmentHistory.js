import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db.js';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  const history = query(
    `SELECT th.*, p.nama_pasien, p.no_whatsapp
     FROM treatment_history th
     JOIN patients p ON p.id = th.patient_id
     WHERE p.user_id = ?
     ORDER BY th.tanggal_treatment DESC, th.created_at DESC`,
    [req.user.id]
  );
  res.json(history);
});

router.get('/:id', (req, res) => {
  const item = queryOne(
    `SELECT th.*, p.nama_pasien, p.no_whatsapp, p.tanggal_lahir, p.jenis_kelamin, p.alamat
     FROM treatment_history th
     JOIN patients p ON p.id = th.patient_id
     WHERE th.id = ? AND p.user_id = ?`,
    [req.params.id, req.user.id]
  );

  if (!item) return res.status(404).json({ message: 'Riwayat treatment tidak ditemukan' });

  res.json(item);
});

router.post('/', (req, res) => {
  const { booking_id, patient_id, tanggal_treatment, treatment_yang_dilakukan, keluhan_pasien, catatan_hasil } = req.body;

  if (!booking_id || !patient_id || !tanggal_treatment || !treatment_yang_dilakukan) {
    return res.status(400).json({ message: 'Booking ID, Patient ID, tanggal treatment, dan treatment yang dilakukan wajib diisi' });
  }

  const booking = queryOne(
    'SELECT id FROM bookings WHERE id = ? AND user_id = ?',
    [booking_id, req.user.id]
  );
  if (!booking) {
    return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
  }

  const patient = queryOne(
    'SELECT id FROM patients WHERE id = ? AND user_id = ?',
    [patient_id, req.user.id]
  );
  if (!patient) {
    return res.status(404).json({ message: 'Pasien tidak ditemukan' });
  }

  const id = execute(
    `INSERT INTO treatment_history (booking_id, patient_id, tanggal_treatment, treatment_yang_dilakukan, keluhan_pasien, catatan_hasil)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [booking_id, patient_id, tanggal_treatment, treatment_yang_dilakukan, keluhan_pasien || '', catatan_hasil || '']
  );

  const newHistory = queryOne(
    `SELECT th.*, p.nama_pasien, p.no_whatsapp
     FROM treatment_history th
     JOIN patients p ON p.id = th.patient_id
     WHERE th.id = ?`,
    [id]
  );

  res.status(201).json(newHistory);
});

export default router;