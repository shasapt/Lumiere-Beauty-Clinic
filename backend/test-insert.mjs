import initSqlJs from 'sql.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'lumiere.db');

async function test() {
  const SQL = await initSqlJs();
  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buffer);
  
  console.log("Before insert, count:", db.exec("SELECT COUNT(*) FROM patients")[0].values[0][0]);
  
  try {
    db.run("INSERT INTO patients (user_id, nama_pasien, no_whatsapp, tanggal_lahir, jenis_kelamin, alamat) VALUES (?, ?, ?, ?, ?, ?)", 
      [1, "Debug Test", "081234567999", "2000-01-01", "P", "Debug"]);
    console.log("Insert successful");
    console.log("Last insert ID:", db.exec("SELECT last_insert_rowid() AS id")[0].values[0][0]);
    console.log("After insert, count:", db.exec("SELECT COUNT(*) FROM patients")[0].values[0][0]);
  } catch (e) {
    console.error("Insert error:", e.message);
  }
}

test();