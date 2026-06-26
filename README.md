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


## Revisi akhir
- Layer bangunan hasil digitasi ditambahkan dalam `assets/geojson/bangunan_faskes.geojson` dan `assets/shp/bangunan_digitasi/`.
- Shapefile siap pakai juga tersedia sebagai `assets/shp/bangunan_digitasi_shp.zip`.
- Database ditambah tabel `bangunan_digitasi` dan `faskes_ketersediaan`.
- Halaman login memiliki dua mode: login dan buat akun.
- Atribut layanan kesehatan ditambah: IGD beserta jam operasional, dokter umum, dokter spesialis, rawat jalan, rawat inap, dan konsultasi dokter penyakit dalam.
- Warna diperkuat agar kontras pada peta, kartu, tombol, dan panel analisis.
