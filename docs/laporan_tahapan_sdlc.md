# Laporan Ringkas Pengembangan GeoPlay Purworejo

## 1. Software Development Lifecycle

Model SDLC yang digunakan adalah Prototype. Model ini dipilih karena pengembangan WebGIS membutuhkan proses uji tampilan dan fungsi secara bertahap. Komponen seperti peta, simbol, filter, popup, grafik, dan dashboard admin perlu dicoba langsung agar kekurangannya dapat diperbaiki sebelum sistem dianggap final.

Tahapan yang digunakan meliputi analisis kebutuhan, perancangan cepat, pembuatan prototype, evaluasi prototype, serta implementasi dan dokumentasi.

## 2. Jenis User

Sistem memiliki tiga jenis user. Pengguna umum dapat mengakses peta, mencari fasilitas, menggunakan filter, melihat analisis, dan mengekspor data. Admin dapat login untuk menambah, mengubah, dan menghapus data fasilitas kesehatan. Operator disiapkan sebagai role tambahan untuk pengembangan validasi data lapangan.

## 3. Database Geospasial

Database menggunakan PostgreSQL/PostGIS. Tabel utama terdiri dari app_users, fasilitas_kesehatan, wilayah_administrasi, dan activity_logs. Data titik fasilitas kesehatan disimpan pada kolom geometri bertipe Point dengan sistem koordinat EPSG:4326. Data wilayah administrasi disimpan sebagai MultiPolygon.

## 4. Tujuan Sistem

Tujuan sistem adalah menginventarisasi data fasilitas kesehatan, memvisualisasikan sebaran fasilitas, membantu pengguna menemukan fasilitas terdekat, dan mendukung admin dalam mengelola data spasial.

## 5. Analisis yang Digunakan

Analisis yang digunakan meliputi jumlah fasilitas per jenis, jumlah fasilitas per kecamatan, kecamatan dengan data terbanyak dan paling sedikit, buffer radius 1 km sampai 5 km, fasilitas terdekat dari lokasi pengguna, dan rute menuju fasilitas. Analisis ini masih berbasis titik fasilitas yang tersedia dan belum menggunakan data jumlah penduduk atau kapasitas layanan.
