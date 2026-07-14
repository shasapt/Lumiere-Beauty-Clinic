import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'lumiere.db');

let db;

export async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nama_klinik TEXT NOT NULL DEFAULT 'Lumiere Beauty Clinic',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      nama_pasien TEXT NOT NULL,
      no_whatsapp TEXT NOT NULL,
      tanggal_lahir TEXT,
      jenis_kelamin TEXT CHECK(jenis_kelamin IN ('L', 'P')),
      alamat TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS treatments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      nama_treatment TEXT NOT NULL,
      kategori TEXT NOT NULL,
      harga INTEGER NOT NULL DEFAULT 0,
      durasi INTEGER NOT NULL DEFAULT 60,
      deskripsi_singkat TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      tanggal_reservasi TEXT NOT NULL,
      jam_reservasi TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'baru' CHECK(status IN ('baru','dikonfirmasi','sedang_treatment','selesai','dibatalkan')),
      total_harga INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS booking_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      treatment_id INTEGER NOT NULL,
      jumlah INTEGER NOT NULL DEFAULT 1,
      harga_satuan INTEGER NOT NULL DEFAULT 0,
      subtotal INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (treatment_id) REFERENCES treatments(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS treatment_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      tanggal_treatment TEXT NOT NULL,
      treatment_yang_dilakukan TEXT NOT NULL,
      keluhan_pasien TEXT DEFAULT '',
      catatan_hasil TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      judul TEXT NOT NULL,
      deskripsi TEXT DEFAULT '',
      tanggal_mulai TEXT NOT NULL,
      tanggal_selesai TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'tidak aktif' CHECK(status IN ('aktif','tidak aktif')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  const result = db.exec("SELECT id FROM users WHERE username = 'admin'");
  let adminId;
  if (result.length === 0 || result[0].values.length === 0) {
    const hash = bcrypt.hashSync('admin123', 12);
    db.run(
      'INSERT INTO users (username, email, password_hash, nama_klinik) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@lumiere.com', hash, 'Lumiere Beauty Clinic']
    );
    adminId = db.exec("SELECT last_insert_rowid() AS id")[0].values[0][0];
    console.log('Admin user seeded: admin / admin123');
  } else {
    adminId = result[0].values[0][0];
  }

  const patientCount = db.exec("SELECT COUNT(*) AS c FROM patients WHERE user_id = " + adminId);
  if (!patientCount[0]?.values?.[0]?.[0]) {
    const samplePatients = [
      ['Sarah Wijaya', '081234567890', '1995-03-12', 'P', 'Jl. Merdeka No. 45, Jakarta'],
      ['Dian Permata', '081298765432', '1998-07-25', 'P', 'Jl. Sudirman No. 12, Bandung'],
      ['Maya Indah', '087812345678', '2000-11-05', 'P', 'Jl. Gatot Subroto No. 78, Jakarta'],
      ['Rina Amelia', '085611223344', '1993-02-18', 'P', 'Jl. Diponegoro No. 34, Surabaya'],
      ['Ayu Lestari', '082134567890', '1996-09-30', 'P', 'Jl. Braga No. 56, Bandung'],
      ['Budi Santoso', '081377889900', '1990-06-14', 'L', 'Jl. Thamrin No. 90, Jakarta'],
    ];
    for (const p of samplePatients) {
      db.run('INSERT INTO patients (user_id, nama_pasien, no_whatsapp, tanggal_lahir, jenis_kelamin, alamat) VALUES (?, ?, ?, ?, ?, ?)', [adminId, ...p]);
    }
    console.log('Sample patients seeded');
  }

  const treatmentCount = db.exec("SELECT COUNT(*) AS c FROM treatments WHERE user_id = " + adminId);
  if (!treatmentCount[0]?.values?.[0]?.[0]) {
    const sampleTreatments = [
      ['Facial Gold', 'Facial', 350000, 90, 'Facial premium dengan gold serum untuk kulit cerah'],
      ['Deep Cleansing Facial', 'Facial', 200000, 60, 'Facial pembersihan pori-pori secara mendalam'],
      ['Chemical Peeling Medium', 'Chemical Peeling', 500000, 75, 'Pengelupasan kulit kimia untuk regenerasi sel'],
      ['Chemical Peeling Light', 'Chemical Peeling', 350000, 60, 'Chemical peeling ringan untuk kulit sensitif'],
      ['Laser Rejuvenation', 'Laser Treatment', 800000, 90, 'Peremajaan kulit dengan teknologi laser'],
      ['Laser Hair Removal', 'Laser Treatment', 600000, 60, 'Penghilangan bulu permanen dengan laser'],
      ['Acne Treatment Basic', 'Acne Treatment', 250000, 45, 'Perawatan jerawat dasar'],
      ['Acne Treatment Intensive', 'Acne Treatment', 400000, 75, 'Perawatan jerawat intensif dengan peeling'],
      ['Whitening Booster', 'Whitening Treatment', 450000, 60, 'Perawatan pemutih kulit dengan vitamin C'],
      ['Whitening Package', 'Whitening Treatment', 750000, 120, 'Paket whitening lengkap 3 sesi'],
      ['Botox Frown Lines', 'Botox & Filler', 2000000, 30, 'Injeksi botox untuk kerutan dahi'],
      ['Lip Filler', 'Botox & Filler', 1500000, 30, 'Filler bibir untuk volume alami'],
      ['Skin Booster Hydra', 'Skin Booster', 600000, 60, 'Hidrasi kulit dengan hyaluronic acid'],
      ['Skin Booster Glow', 'Skin Booster', 750000, 75, 'Booster kulit bercahaya dengan glutathione'],
    ];
    for (const t of sampleTreatments) {
      db.run('INSERT INTO treatments (user_id, nama_treatment, kategori, harga, durasi, deskripsi_singkat) VALUES (?, ?, ?, ?, ?, ?)', [adminId, ...t]);
    }
    console.log('Sample treatments seeded');
  }

  const bookingCount = db.exec("SELECT COUNT(*) AS c FROM bookings WHERE user_id = " + adminId);
  if (!bookingCount[0]?.values?.[0]?.[0]) {
    const patients = db.exec("SELECT id, nama_pasien FROM patients WHERE user_id = " + adminId);
    const treatments = db.exec("SELECT id, harga FROM treatments WHERE user_id = " + adminId);
    const pIds = patients[0].values.map((r) => r[0]);
    const tIds = treatments[0].values.map((r) => ({ id: r[0], harga: r[1] }));

    const today = new Date();
    const sampleBookings = [
      { patient: 0, date: today.toISOString().split('T')[0], time: '09:00', status: 'dikonfirmasi', items: [0, 2] },
      { patient: 1, date: today.toISOString().split('T')[0], time: '10:30', status: 'sedang_treatment', items: [1] },
      { patient: 2, date: today.toISOString().split('T')[0], time: '13:00', status: 'baru', items: [3, 6] },
      { patient: 3, date: today.toISOString().split('T')[0], time: '14:30', status: 'dikonfirmasi', items: [4] },
      { patient: 4, date: today.toISOString().split('T')[0], time: '16:00', status: 'baru', items: [5] },
    ];
    for (const sb of sampleBookings) {
      let total = 0;
      const itemRows = [];
      for (const ti of sb.items) {
        const t = tIds[ti];
        const harga = t.harga;
        total += harga;
        itemRows.push({ treatment_id: t.id, harga_satuan: harga });
      }
      const patientId = pIds[sb.patient];
      db.run(
        'INSERT INTO bookings (user_id, patient_id, tanggal_reservasi, jam_reservasi, status, total_harga) VALUES (?, ?, ?, ?, ?, ?)',
        [adminId, patientId, sb.date, sb.time, sb.status, total]
      );
      const bookingId = db.exec("SELECT last_insert_rowid() AS id")[0].values[0][0];
      for (const ir of itemRows) {
        db.run(
          'INSERT INTO booking_items (booking_id, treatment_id, jumlah, harga_satuan, subtotal) VALUES (?, ?, 1, ?, ?)',
          [bookingId, ir.treatment_id, ir.harga_satuan, ir.harga_satuan]
        );
      }
    }
    console.log('Sample bookings seeded');
  }

  saveDb();
  return db;
}

export function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function execute(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return db.exec("SELECT last_insert_rowid() AS id")?.[0]?.values?.[0]?.[0] || null;
}
