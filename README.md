# GeoPlay Purworejo — Fullstack WebGIS Fasilitas Kesehatan

Versi ini adalah upgrade tampilan dan fitur dari WebGIS sebelumnya. Tema warna dibuat dengan nuansa Toy Story: biru, kuning, merah, hijau, dan putih. Sistem tetap menggunakan struktur fullstack sederhana: frontend HTML/CSS/JavaScript, backend PHP API, dan database PostgreSQL/PostGIS.

## Tujuan Sistem

1. Menginventarisasi data fasilitas kesehatan berdasarkan nama, jenis, kecamatan, alamat, sumber data, dan koordinat.
2. Memvisualisasikan sebaran fasilitas kesehatan pada peta interaktif.
3. Membantu pengguna melakukan pencarian lokasi, filter data, pencarian fasilitas terdekat, rute, dan analisis radius layanan.
4. Menyediakan dashboard admin untuk mengelola data spasial yang tersimpan dalam database.

## Analisis yang Digunakan

Analisis disesuaikan dengan tujuan sistem, yaitu:

- Analisis jumlah fasilitas per jenis.
- Analisis jumlah fasilitas per kecamatan.
- Analisis kecamatan dengan data terbanyak dan paling sedikit.
- Analisis buffer radius 1 km, 3 km, dan 5 km dari fasilitas terpilih.
- Analisis fasilitas terdekat dari posisi pengguna.
- Analisis rute menuju fasilitas.

Catatan: analisis masih berbasis jumlah titik fasilitas. Sistem belum menggunakan data jumlah penduduk, daya tampung layanan, atau waktu tempuh riil karena data tersebut belum tersedia.

## Struktur Halaman

- `index.html` — landing page dengan tema Toy Story dan ringkasan tujuan sistem.
- `map.html` — peta interaktif, filter, grafik, buffer radius, fasilitas terdekat, rute, dan ekspor CSV.
- `data.html` — katalog data dan interpretasi sebaran.
- `login.html` — halaman login admin.
- `admin.html` — dashboard admin untuk tambah, edit, dan hapus data.
- `laporan.html` — penjelasan SDLC, jenis user, database, dan analisis.

## Database

File SQL utama:

```text
/database/schema_postgresql.sql
```

Import melalui pgAdmin Query Tool, bukan Restore.

## Akun Admin Awal

```text
Email: admin@webgis.local
Password: admin123
```

## Menjalankan Website

Dari folder project, jalankan:

```bash
php -S localhost:8000
```

Kemudian buka:

```text
http://localhost:8000/index.html
```

Jika database/API belum aktif, website tetap dapat menampilkan data dari GeoJSON fallback. Namun, fitur simpan permanen di admin membutuhkan PostgreSQL/PostGIS dan koneksi API yang benar.
