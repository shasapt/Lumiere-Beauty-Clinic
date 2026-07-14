import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from '../db.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password wajib diisi' });
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Format data tidak valid' });
  }

  const user = queryOne('SELECT * FROM users WHERE username = ?', [username]);

  if (!user) {
    return res.status(401).json({ message: 'Username atau password salah' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ message: 'Username atau password salah' });
  }

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      nama_klinik: user.nama_klinik,
    },
  });
});

router.get('/me', authenticateToken, (req, res) => {
  const user = queryOne(
    'SELECT id, username, email, nama_klinik, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user });
});

router.put('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password dan new password wajib diisi' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
  }

  const user = queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
  const valid = bcrypt.compareSync(currentPassword, user.password_hash);

  if (!valid) {
    return res.status(401).json({ message: 'Password saat ini salah' });
  }

  const password_hash = bcrypt.hashSync(newPassword, 12);
  execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, req.user.id]);

  res.json({ message: 'Password berhasil diubah' });
});

export default router;
