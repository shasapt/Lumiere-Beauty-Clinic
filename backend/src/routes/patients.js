import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db.js';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  const patients = query(
    'SELECT * FROM patients WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(patients);
});

router.get('/:id', (req, res) => {
  const patient = queryOne(
    'SELECT * FROM patients WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!patient) return res.status(404).json({ message: 'Pasien tidak ditemukan' });
  res.json(patient);
});

router.post('/', (req, res) => {
  const { nama_pasien, no_whatsapp, tanggal_lahir, jenis_kelamin, alamat } = req.body;

  if (!nama_pasien?.trim() || !no_whatsapp?.trim()) {
    return res.status(400).json({ message: 'Nama dan nomor WhatsApp wajib diisi' });
  }

  const id = execute(
    `INSERT INTO patients (user_id, nama_pasien, no_whatsapp, tanggal_lahir, jenis_kelamin, alamat)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, nama_pasien.trim(), no_whatsapp.trim(), tanggal_lahir || null, jenis_kelamin || null, alamat || null]
  );

  const patient = queryOne('SELECT * FROM patients WHERE id = ?', [id]);
  res.status(201).json(patient);
});

router.put('/:id', (req, res) => {
  const existing = queryOne(
    'SELECT * FROM patients WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!existing) return res.status(404).json({ message: 'Pasien tidak ditemukan' });

  const { nama_pasien, no_whatsapp, tanggal_lahir, jenis_kelamin, alamat } = req.body;

  if (!nama_pasien?.trim() || !no_whatsapp?.trim()) {
    return res.status(400).json({ message: 'Nama dan nomor WhatsApp wajib diisi' });
  }

  execute(
    `UPDATE patients SET nama_pasien = ?, no_whatsapp = ?, tanggal_lahir = ?, jenis_kelamin = ?, alamat = ?
     WHERE id = ? AND user_id = ?`,
    [nama_pasien.trim(), no_whatsapp.trim(), tanggal_lahir || null, jenis_kelamin || null, alamat || null, req.params.id, req.user.id]
  );

  const patient = queryOne('SELECT * FROM patients WHERE id = ?', [req.params.id]);
  res.json(patient);
});

router.delete('/:id', (req, res) => {
  const existing = queryOne(
    'SELECT * FROM patients WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!existing) return res.status(404).json({ message: 'Pasien tidak ditemukan' });

  execute('DELETE FROM patients WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Pasien berhasil dihapus' });
});

export default router;
