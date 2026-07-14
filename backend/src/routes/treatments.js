import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db.js';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  const { kategori } = req.query;
  let sql = 'SELECT * FROM treatments WHERE user_id = ?';
  const params = [req.user.id];

  if (kategori) {
    sql += ' AND kategori = ?';
    params.push(kategori);
  }

  sql += ' ORDER BY created_at DESC';
  const treatments = query(sql, params);
  res.json(treatments);
});

router.get('/:id', (req, res) => {
  const treatment = queryOne(
    'SELECT * FROM treatments WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!treatment) return res.status(404).json({ message: 'Treatment tidak ditemukan' });
  res.json(treatment);
});

router.post('/', (req, res) => {
  const { nama_treatment, kategori, harga, durasi, deskripsi_singkat } = req.body;

  if (!nama_treatment?.trim() || !kategori?.trim()) {
    return res.status(400).json({ message: 'Nama treatment dan kategori wajib diisi' });
  }

  const id = execute(
    `INSERT INTO treatments (user_id, nama_treatment, kategori, harga, durasi, deskripsi_singkat)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      nama_treatment.trim(),
      kategori.trim(),
      parseInt(harga) || 0,
      parseInt(durasi) || 60,
      deskripsi_singkat || '',
    ]
  );

  const treatment = queryOne('SELECT * FROM treatments WHERE id = ?', [id]);
  res.status(201).json(treatment);
});

router.put('/:id', (req, res) => {
  const existing = queryOne(
    'SELECT * FROM treatments WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!existing) return res.status(404).json({ message: 'Treatment tidak ditemukan' });

  const { nama_treatment, kategori, harga, durasi, deskripsi_singkat } = req.body;

  if (!nama_treatment?.trim() || !kategori?.trim()) {
    return res.status(400).json({ message: 'Nama treatment dan kategori wajib diisi' });
  }

  execute(
    `UPDATE treatments SET nama_treatment = ?, kategori = ?, harga = ?, durasi = ?, deskripsi_singkat = ?
     WHERE id = ? AND user_id = ?`,
    [
      nama_treatment.trim(),
      kategori.trim(),
      parseInt(harga) || 0,
      parseInt(durasi) || 60,
      deskripsi_singkat || '',
      req.params.id,
      req.user.id,
    ]
  );

  const treatment = queryOne('SELECT * FROM treatments WHERE id = ?', [req.params.id]);
  res.json(treatment);
});

router.delete('/:id', (req, res) => {
  const existing = queryOne(
    'SELECT * FROM treatments WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!existing) return res.status(404).json({ message: 'Treatment tidak ditemukan' });

  execute('DELETE FROM treatments WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Treatment berhasil dihapus' });
});

export default router;
