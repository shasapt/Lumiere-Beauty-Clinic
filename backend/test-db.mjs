import initSqlJs from 'sql.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'lumiere.db');

const SQL = await initSqlJs();

let db;
if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
} else {
    db = new SQL.Database();
}

const result = db.exec("SELECT COUNT(*) as c FROM promotions");
console.log("Promotions count:", result[0]?.values?.[0]?.[0]);

db.close();