import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db.js';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  const promotions = query(
    'SELECT * FROM promotions WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(promotions);
});

router.get('/:id', (req, res) => {
  const promotion = queryOne(
    'SELECT * FROM promotions WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!promotion) return res.status(404).json({ message: 'Promo tidak ditemukan' });
  res.json(promotion);
});

router.post('/', (req, res) => {
  const { judul, deskripsi, tanggal_mulai, tanggal_selesai, status } = req.body;

  if (!judul?.trim() || !tanggal_mulai || !tanggal_selesai) {
    return res.status(400).json({ message: 'Judul, tanggal mulai, dan tanggal selesai wajib diisi' });
  }

  const id = execute(
    `INSERT INTO promotions (user_id, judul, deskripsi, tanggal_mulai, tanggal_selesai, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, judul.trim(), deskripsi?.trim() || '', tanggal_mulai, tanggal_selesai, status || 'tidak aktif']
  );

  const promotion = queryOne('SELECT * FROM promotions WHERE id = ?', [id]);
  res.status(201).json(promotion);
});

router.put('/:id', (req, res) => {
  const existing = queryOne(
    'SELECT * FROM promotions WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!existing) return res.status(404).json({ message: 'Promo tidak ditemukan' });

  const { judul, deskripsi, tanggal_mulai, tanggal_selesai, status } = req.body;

  if (!judul?.trim() || !tanggal_mulai || !tanggal_selesai) {
    return res.status(400).json({ message: 'Judul, tanggal mulai, dan tanggal selesai wajib diisi' });
  }

  execute(
    `UPDATE promotions SET judul = ?, deskripsi = ?, tanggal_mulai = ?, tanggal_selesai = ?, status = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`,
    [judul.trim(), deskripsi?.trim() || '', tanggal_mulai, tanggal_selesai, status || 'tidak aktif', req.params.id, req.user.id]
  );

  const promotion = queryOne('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
  res.json(promotion);
});

router.delete('/:id', (req, res) => {
  const existing = queryOne(
    'SELECT * FROM promotions WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!existing) return res.status(404).json({ message: 'Promo tidak ditemukan' });

  execute('DELETE FROM promotions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Promo berhasil dihapus' });
});

export default router;