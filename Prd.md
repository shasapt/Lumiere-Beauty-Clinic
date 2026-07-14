# Perencanaan Aplikasi Web - Lumiere Beauty Clinic

## 1. Ringkasan Proyek

**Nama Aplikasi**: Lumiere Beauty Clinic  
**Target Pengguna**: Admin/owner klinik kecantikan  
**Konsep**: SaaS (multi-tenant)  
**Platform**: Web responsive (mobile-first)  

## 2. Kebutuhan & Penyederhanaan

### Fitur Utama (Wajib):
- Manajemen layanan treatment kecantikan
- Pencatatan reservasi pasien
- Penyimpanan data pasien lengkap
- Dashboard pemantauan pendapatan dan statistik
- Riwayat treatment pasien
- Laporan usaha sederhana
- Promo sederhana

### Fitur Dikecualikan:
- Payment gateway
- Manajemen stok produk/skincare
- Pelacakan lokasi
- Integrasi pihak ketiga
- Rekam medis lengkap
- Fitur kompleks lainnya

## 3. Spesifikasi Teknis

### 3.1 Frontend
- **Framework**: React.js dengan Vite atau Next.js
- **Styling**: Tailwind CSS (mobile-first, utility-first)
- **UI Components**: Memuat library sederhana (Heroicons, dll)
- **Responsive**: Mobile-first approach
- **Optimisasi**: Kompresi gambar, lazy loading, minimal JS bundle

### 3.2 Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL / MySQL atau SQLite (untuk skala kecil)
- **Authentication**: JWT-based multi-tenant auth
- **File Upload**: Untuk foto layanan (opsional, ukuran terbatas)

### 3.3 Deployment
- **Hosting**: Vercel/Netlify (frontend) + Railway/Render (backend)
- **Database**: Managed DB atau self-hosted

## 4. Struktur Data

### 4.1 Users (Akun Klinik)
```
- id (PK)
- nama_klinik
- email
- password_hash
- created_at
```

### 4.2 Patients (Pasien)
```
- id (PK)
- user_id (FK)
- nama_pasien
- no_whatsapp
- tanggal_lahir
- jenis_kelamin (L/P)
- alamat (opsional)
- created_at
```

### 4.3 Treatments (Layanan Treatment)
```
- id (PK)
- user_id (FK)
- nama_treatment
- kategori
- harga
- durasi (menit)
- deskripsi_singkat
- created_at
```

### 4.4 Bookings (Reservasi)
```
- id (PK)
- user_id (FK)
- patient_id (FK)
- tanggal_reservasi
- jam_reservasi
- status (baru/dikonfirmasi/sedang_treatment/selesai/dibatalkan)
- total_harga
- created_at
- updated_at
```

### 4.5 Booking_Items (Item Reservasi)
```
- id (PK)
- booking_id (FK)
- treatment_id (FK)
- jumlah
- harga_satuan
- subtotal
```

### 4.6 Treatment_History (Riwayat Treatment)
```
- id (PK)
- booking_id (FK)
- patient_id (FK)
- tanggal_treatment
- treatment_yang_dilakukan
- keluhan_pasien
- catatan_hasil
- created_at
```

### 4.7 Promotions (Promo)
```
- id (PK)
- user_id (FK)
- judul
- deskripsi
- tanggal_mulai
- tanggal_selesai
- status (aktif/tidak aktif)
- created_at
```

## 5. Halaman & Navigasi

### 5.1 Routing
```
/                    (Beranda/Dashboard)
/treatments          (Kelola Treatment)
/patients            (Kelola Pasien)
/bookings            (Kelola Reservasi)
/history             (Riwayat Treatment)
/reports             (Laporan Usaha)
/promotions          (Kelola Promo)
/profile             (Profil Klinik)
/auth/login
/auth/register
```

### 5.2 Dashboard (Beranda)
**Komponen UI:**
- Card statistik (grid 2 kolom di mobile)
- Jumlah reservasi hari ini
- Reservasi sedang diproses
- Reservasi telah selesai
- Total pendapatan hari ini
- Pendapatan bulan berjalan
- Treatment terlaris (top 3/5)
- Jumlah pasien aktif

**Tombol Utama:**
- [ TAMBAH RESERVASI ] (sticky bottom / prominent button)

### 5.3 Treatment Page
- Daftar treatment (list/card view)
- Filter kategori treatment
- Form tambah/edit treatment (nama, kategori, harga, durasi, deskripsi)

### 5.4 Pasien Page
- Daftar pasien (list view)
- Form tambah/edit pasien (nama, WA, tgl lahir, gender, alamat)
- Detail pasien dengan riwayat treatment

### 5.5 Reservasi Page
- Daftar reservasi dengan filter status
- Tab filter: Semua | Baru | Dikonfirmasi | Sedang Treatment | Selesai | Dibatalkan
- Form tambah reservasi (pilih pasien, tambah treatment, set tanggal/jam)
- Update status reservasi
- Detail reservasi

### 5.6 Riwayat Treatment Page
- Daftar riwayat treatment semua pasien
- Filter berdasarkan tanggal/pasien
- Detail riwayat (keluhan, catatan hasil)

### 5.7 Laporan Page
- Ringkasan total transaksi
- Total pendapatan
- Jumlah reservasi
- Jumlah pasien
- Treatment paling banyak digunakan (chart sederhana/bar)
- Grafik pendapatan berdasarkan periode

### 5.8 Promo Page
- Daftar promo
- Form tambah/edit promo (judul, deskripsi, periode, status)
- Toggle status aktif/tidak aktif

### 5.9 Profil Page
- Informasi Klinik
- Ganti password
- Logout

## 6. Desain UI/UX

### 6.1 Palet Warna
- Dusty Rose      : #C7A6A1 (primary)
- Off White       : #FCFBF8 (background)
- Linen           : #F3EEE8 (card)
- Warm Gray       : #8C8177 (secondary text)
- Dark Cocoa      : #433831 (primary text)
- Gold            : #C7A96B (accent)

### 6.2 Typography
- **Font**: System font stack (Roboto/Noto untuk Android)
- **Ukuran**: Minimal 16px untuk readability

### 6.3 Komponen UI
- Button besar (min 44px height) untuk touch target
- Card dengan shadow minimal
- Form input dengan label yang jelas
- Icon sederhana (Heroicons)

## 7. Data Pasien

### Field yang Disimpan:
- Nama pasien
- Nomor WhatsApp
- Tanggal lahir
- Jenis kelamin (Laki-laki/Perempuan)
- Alamat (opsional)
- Riwayat treatment (relasi ke Treatment_History)

## 8. Data Treatment

### Field yang Dikelola:
- Nama treatment
- Kategori treatment
- Harga
- Durasi treatment (menit)
- Deskripsi singkat

## 9. Riwayat Treatment Pasien

### Informasi yang Ditampilkan:
- Tanggal treatment
- Treatment yang dilakukan
- Keluhan pasien
- Catatan hasil treatment

## 10. Kategori Treatment

### Default Categories:
- Facial
- Chemical Peeling
- Laser Treatment
- Acne Treatment
- Whitening Treatment
- Botox & Filler
- Skin Booster

## 11. Status Reservasi

### Status Flow:
- **Reservasi Baru** - Pasien baru membuat reservasi
- **Dikonfirmasi** - Reservasi sudah dikonfirmasi oleh klinik
- **Sedang Treatment** - Pasien sedang dalam sesi treatment
- **Selesai** - Treatment telah selesai
- **Dibatalkan** - Reservasi dibatalkan

## 12. Fitur Promo

### Field Promo:
- Judul promo
- Deskripsi promo
- Periode promo (tanggal mulai - tanggal selesai)
- Status aktif/tidak aktif

### Manajemen Promo:
- Buat promo baru
- Edit promo yang ada
- Nonaktifkan promo yang sudah berakhir
- Lihat daftar promo yang aktif

## 13. API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/treatments
POST   /api/treatments
PUT    /api/treatments/:id
DELETE /api/treatments/:id

GET    /api/patients
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id

GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id/status
PUT    /api/bookings/:id

GET    /api/treatment-history
GET    /api/treatment-history/:id
POST   /api/treatment-history

GET    /api/promotions
POST   /api/promotions
PUT    /api/promotions/:id
DELETE /api/promotions/:id

GET    /api/reports/dashboard
GET    /api/reports/period
```

## 14. Wireframe Halaman

### 14.1 Dashboard
[Header: Lumiere Beauty Clinic]
┌─────────────┬─────────────┐
│ Reservasi   │ Rp XX.XXX   │  <- Hari Ini
│ Hari Ini    │ Pendapatan  │
├─────────────┼─────────────┤
│ Diproses: X │ Selesai: Y  │
├─────────────┴─────────────┤
│ Rp XX.XXX   │ Rp YY.YYY   │
│ Hari Ini    │ Bulan Ini   │
├─────────────┬─────────────┤
│ Pasien Aktif │ Treatment   │
│ Aktif: Z    │ Terlaris    │
└─────────────┴─────────────┘
[Treatment Terlaris - List horizontal]
[====================]
[TAMBAH RESERVASI] <- Sticky/FAB

### 14.2 Treatment
[Header] [+ Tambah Treatment]
[Filter: Semua | Facial | Laser | ...]
[List Treatment Cards: Nama, Kategori, Harga, Durasi]

### 14.3 Pasien
[Header] [+ Tambah Pasien]
[List Pasien Cards: Nama, WA, Umur, Treatment Terakhir]

### 14.4 Reservasi
[Header] [+ Reservasi Baru]
[Tab: Semua | Baru | Dikonfirmasi | Treatment | Selesai | Dibatalkan]
[List Reservasi: Nama Pasien, Tanggal, Status, Total]

### 14.5 Riwayat Treatment
[Header]
[Filter: Semua | Bulan Ini | Custom]
[List Riwayat: Tanggal, Nama Pasien, Treatment, Hasil]

### 14.6 Promo
[Header] [+ Tambah Promo]
[List Promo Cards: Judul, Periode, Status]
[Toggle aktif/tidak aktif]

## 15. Rencana Pengembangan

### Fase 1: Setup & Auth
- Setup project structure (frontend/backend)
- Authentication system (JWT)
- Multi-tenant data isolation

### Fase 2: Patient Management
- CRUD pasien
- Data pasien lengkap (nama, WA, lahir, gender, alamat)

### Fase 3: Treatment Management
- CRUD treatment
- Kategori treatment (Facial, Laser, dll)
- Durasi treatment

### Fase 4: Booking System
- CRUD reservasi
- Status management (5 status)
- Patient integration
- Big "Tambah Reservasi" button

### Fase 5: Treatment History
- Riwayat treatment pasien
- Keluhan & catatan hasil

### Fase 6: Promo Feature
- CRUD promo
- Status aktif management

### Fase 7: Dashboard & Reports
- Dashboard statistik lengkap
- Laporan sederhana dengan grafik
- Treatment terlaris
- Grafik pendapatan periode

## 16. Pertimbangan Khusus

### Fokus Aplikasi:
- Pengelolaan data pasien
- Reservasi treatment
- Riwayat treatment
- Promo sederhana
- Dashboard pemantauan usaha
- Pelaporan usaha

### Mobile-First Approach:
- Touch target minimum 44px
- Font size minimum 16px
- Navigasi bawah (bottom nav) atau hamburger menu
- Loading indicator untuk koneksi lambat
- Offline handling (localStorage backup)

### Multi-Tenant:
- Semua query dengan filter user_id
- Data terpisah per akun salon
- Role-based access (owner/staff opsional)

### Performance untuk Internet Lambat:
- Bundle size minimal
- Image compression
- Caching strategy
- Skeleton loading