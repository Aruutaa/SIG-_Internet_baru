# GeoHealth Purworejo - WebGIS Fasilitas Kesehatan

Paket ini memakai tampilan Toy Story dari versi sebelumnya dengan isi yang langsung ke fungsi sistem, SDLC, database, user, dan analisis kesehatan.

## Struktur
- `index.html` beranda WebGIS
- `map.html` peta interaktif
- `data.html` katalog data fasilitas kesehatan
- `login.html` login admin
- `admin.html` dashboard pengelolaan data
- `laporan.html` dokumentasi SDLC, user, database, dan analisis
- `database/schema_postgresql.sql` skema PostgreSQL/PostGIS

## Menjalankan
```bash
php -S localhost:8000
```
Buka `http://localhost:8000/index.html`.

## Database
Import `database/schema_postgresql.sql` melalui pgAdmin Query Tool. Skema sudah memuat tabel kesehatan tambahan: jenis fasilitas, layanan kesehatan, relasi fasilitas-layanan, kunjungan bulanan, atribut BPJS, IGD, rawat inap, ambulans, jumlah dokter, tenaga kesehatan, kapasitas tempat tidur, rating, dan geometri PostGIS.

## Akun demo
Email: `admin@webgis.local`  
Password: `admin123`
