# Lumiere Beauty Clinic

Lumiere Beauty Clinic adalah aplikasi web berbasis React dan Node.js yang dibuat untuk membantu pengelolaan operasional klinik kecantikan secara terstruktur. Aplikasi ini mencakup pengelolaan pasien, treatment, reservasi, riwayat treatment, promo, dashboard, dan laporan.

## Tujuan Aplikasi

Aplikasi ini dibuat untuk mempermudah admin atau pemilik klinik dalam:

- Mengelola data pasien.
- Mengelola layanan treatment.
- Mencatat dan memantau reservasi.
- Melihat riwayat treatment pasien.
- Mengelola informasi promo.
- Melihat dashboard dan laporan usaha.

## Target Pengguna

Target pengguna aplikasi Lumiere Beauty Clinic adalah:

- Admin klinik kecantikan.
- Pemilik klinik kecantikan.
- Petugas yang mengelola data pasien dan reservasi.

## Fitur Utama

1. Login dan autentikasi admin.
2. Dashboard dengan data klinik.
3. CRUD data pasien.
4. CRUD data treatment.
5. Filter treatment berdasarkan kategori.
6. Sistem reservasi pasien.
7. Perubahan status reservasi.
8. Riwayat treatment pasien.
9. Manajemen promo.
10. Laporan berdasarkan periode.
11. Halaman profil.
12. Logout dan protected route.

## Alur Status Reservasi

Status reservasi berjalan dengan urutan:

```text
baru → dikonfirmasi → sedang_treatment → selesai
```

Reservasi juga dapat diubah menjadi status `dibatalkan`.

## Teknologi yang Digunakan

### Frontend

- React.js
- Vite
- JavaScript
- CSS
- React Router

### Backend

- Node.js
- Express.js
- JWT Authentication
- Bcrypt
- Express Rate Limit

### Database

- SQLite

## Struktur Folder

```text
Lumiere-Beauty-Clinic
├── backend
│   ├── src
│   │   ├── middleware
│   │   ├── routes
│   │   ├── db.js
│   │   └── index.js
│   └── package.json
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   └── App.jsx
│   └── package.json
├── PRD.md
├── README.md
└── .gitignore
```

## Cara Menjalankan Aplikasi

### 1. Menjalankan Backend

Buka terminal, kemudian jalankan:

```bash
cd backend
npm install
node src/index.js
```

Backend akan berjalan pada:

```text
http://localhost:3000
```

### 2. Menjalankan Frontend

Buka terminal baru, kemudian jalankan:

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan pada:

```text
http://localhost:5173
```

## Akun Admin Default

Gunakan akun berikut untuk masuk:

```text
Username: admin
Password: admin123
```

## Dokumentasi Perencanaan

Dokumentasi perencanaan dan kebutuhan aplikasi dapat dilihat pada file:

```text
PRD.md
```

## Repository GitHub

Repository aplikasi:

```text
https://github.com/shasapt/Lumiere-Beauty-Clinic
```

## Status Pengembangan

Seluruh tujuh fase utama pengembangan telah selesai:

1. Setup dan autentikasi.
2. Manajemen pasien.
3. Manajemen treatment.
4. Sistem reservasi.
5. Riwayat treatment.
6. Fitur promo.
7. Dashboard dan laporan.

Aplikasi telah masuk tahap final testing dan penyempurnaan.

## Pengembang

Project ini dibuat untuk memenuhi tugas pengembangan aplikasi web bisnis.