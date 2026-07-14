import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db.js';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT b.*, p.nama_pasien, p.no_whatsapp
    FROM bookings b
    JOIN patients p ON p.id = b.patient_id
    WHERE b.user_id = ?
  `;
  const params = [req.user.id];

  if (status) {
    sql += ' AND b.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY b.tanggal_reservasi DESC, b.jam_reservasi DESC';

  const bookings = query(sql, params);

  const result = bookings.map((b) => {
    const items = query(
      `SELECT bi.*, t.nama_treatment, t.kategori
       FROM booking_items bi
       JOIN treatments t ON t.id = bi.treatment_id
       WHERE bi.booking_id = ?`,
      [b.id]
    );
    return { ...b, items };
  });

  res.json(result);
});

router.get('/:id', (req, res) => {
  const booking = queryOne(
    `SELECT b.*, p.nama_pasien, p.no_whatsapp, p.tanggal_lahir, p.jenis_kelamin, p.alamat
     FROM bookings b
     JOIN patients p ON p.id = b.patient_id
     WHERE b.id = ? AND b.user_id = ?`,
    [req.params.id, req.user.id]
  );

  if (!booking) return res.status(404).json({ message: 'Reservasi tidak ditemukan' });

  const items = query(
    `SELECT bi.*, t.nama_treatment, t.kategori, t.durasi
     FROM booking_items bi
     JOIN treatments t ON t.id = bi.treatment_id
     WHERE bi.booking_id = ?`,
    [booking.id]
  );

  res.json({ ...booking, items });
});

router.post('/', (req, res) => {
  const { patient_id, tanggal_reservasi, jam_reservasi, items } = req.body;

  if (!patient_id || !tanggal_reservasi || !jam_reservasi || !items?.length) {
    return res.status(400).json({ message: 'Pasien, tanggal, jam, dan minimal 1 treatment wajib diisi' });
  }

  const patient = queryOne('SELECT id FROM patients WHERE id = ? AND user_id = ?', [patient_id, req.user.id]);
  if (!patient) return res.status(404).json({ message: 'Pasien tidak ditemukan' });

  let total_harga = 0;
  const itemRows = [];

  for (const item of items) {
    const treatment = queryOne('SELECT * FROM treatments WHERE id = ? AND user_id = ?', [item.treatment_id, req.user.id]);
    if (!treatment) return res.status(400).json({ message: `Treatment ID ${item.treatment_id} tidak ditemukan` });

    const jumlah = parseInt(item.jumlah) || 1;
    const harga_satuan = treatment.harga;
    const subtotal = harga_satuan * jumlah;
    total_harga += subtotal;

    itemRows.push({ treatment_id: treatment.id, jumlah, harga_satuan, subtotal });
  }

  const bookingId = execute(
    `INSERT INTO bookings (user_id, patient_id, tanggal_reservasi, jam_reservasi, status, total_harga)
     VALUES (?, ?, ?, ?, 'baru', ?)`,
    [req.user.id, patient_id, tanggal_reservasi, jam_reservasi, total_harga]
  );

  for (const row of itemRows) {
    execute(
      'INSERT INTO booking_items (booking_id, treatment_id, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)',
      [bookingId, row.treatment_id, row.jumlah, row.harga_satuan, row.subtotal]
    );
  }

  const booking = queryOne(
    `SELECT b.*, p.nama_pasien, p.no_whatsapp
     FROM bookings b JOIN patients p ON p.id = b.patient_id
     WHERE b.id = ?`, [bookingId]
  );

  const savedItems = query(
    `SELECT bi.*, t.nama_treatment, t.kategori
     FROM booking_items bi JOIN treatments t ON t.id = bi.treatment_id
     WHERE bi.booking_id = ?`, [bookingId]
  );

  res.status(201).json({ ...booking, items: savedItems });
});

router.put('/:id', (req, res) => {
  const existing = queryOne('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return res.status(404).json({ message: 'Reservasi tidak ditemukan' });

  const { patient_id, tanggal_reservasi, jam_reservasi, items } = req.body;

  if (!patient_id || !tanggal_reservasi || !jam_reservasi) {
    return res.status(400).json({ message: 'Pasien, tanggal, dan jam wajib diisi' });
  }

  let total_harga = existing.total_harga;
  let newItems = existing.total_harga;

  if (items?.length) {
    total_harga = 0;
    newItems = [];
    for (const item of items) {
      const treatment = queryOne('SELECT * FROM treatments WHERE id = ? AND user_id = ?', [item.treatment_id, req.user.id]);
      if (!treatment) return res.status(400).json({ message: `Treatment ID ${item.treatment_id} tidak ditemukan` });
      const jumlah = parseInt(item.jumlah) || 1;
      const harga_satuan = treatment.harga;
      const subtotal = harga_satuan * jumlah;
      total_harga += subtotal;
      newItems.push({ treatment_id: treatment.id, jumlah, harga_satuan, subtotal });
    }
  }

  execute(
    `UPDATE bookings SET patient_id = ?, tanggal_reservasi = ?, jam_reservasi = ?, total_harga = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`,
    [patient_id, tanggal_reservasi, jam_reservasi, total_harga, req.params.id, req.user.id]
  );

  if (items?.length) {
    execute('DELETE FROM booking_items WHERE booking_id = ?', [req.params.id]);
    for (const row of newItems) {
      execute(
        'INSERT INTO booking_items (booking_id, treatment_id, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, row.treatment_id, row.jumlah, row.harga_satuan, row.subtotal]
      );
    }
  }

  const booking = queryOne(
    `SELECT b.*, p.nama_pasien, p.no_whatsapp
     FROM bookings b JOIN patients p ON p.id = b.patient_id WHERE b.id = ?`,
    [req.params.id]
  );

  const savedItems = query(
    `SELECT bi.*, t.nama_treatment, t.kategori
     FROM booking_items bi JOIN treatments t ON t.id = bi.treatment_id WHERE bi.booking_id = ?`,
    [req.params.id]
  );

  res.json({ ...booking, items: savedItems });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['baru', 'dikonfirmasi', 'sedang_treatment', 'selesai', 'dibatalkan'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  const existing = queryOne('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!existing) return res.status(404).json({ message: 'Reservasi tidak ditemukan' });

  execute(
    "UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
    [status, req.params.id, req.user.id]
  );

  const booking = queryOne(
    `SELECT b.*, p.nama_pasien, p.no_whatsapp
     FROM bookings b JOIN patients p ON p.id = b.patient_id WHERE b.id = ?`,
    [req.params.id]
  );

  res.json(booking);
});

export default router;
