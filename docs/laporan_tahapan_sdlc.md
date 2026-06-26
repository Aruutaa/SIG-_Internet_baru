# Laporan Ringkas Pengembangan GeoHealth Purworejo

## SDLC
Model yang digunakan adalah Prototype. Tahapan dimulai dari perencanaan kebutuhan, analisis data dan user, desain antarmuka serta basis data, implementasi WebGIS, pengujian fungsi, dan pemeliharaan sistem.

## User
Sistem memiliki tiga kelas user: pengunjung, admin, dan operator. Pengunjung memakai peta dan katalog data. Admin mengelola data fasilitas. Operator membantu pembaruan dan validasi data lapangan.

## Database
Database menggunakan PostgreSQL/PostGIS untuk menyimpan atribut dan geometri titik fasilitas kesehatan. Struktur tambahan memuat jenis fasilitas, layanan kesehatan, relasi fasilitas-layanan, kunjungan bulanan, serta log aktivitas.

## Analisis
Analisis yang digunakan meliputi sebaran fasilitas per jenis, sebaran per kecamatan, radius layanan, fasilitas terdekat, rute menuju fasilitas, status BPJS, IGD 24 jam, rawat inap, ambulans, dokter, tenaga kesehatan, dan kapasitas tempat tidur.
