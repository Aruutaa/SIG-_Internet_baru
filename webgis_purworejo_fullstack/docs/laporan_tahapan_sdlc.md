# Laporan Ringkas Pengembangan WebGIS Fasilitas Kesehatan Purworejo

## 1. Gambaran Umum Sistem

Website yang dikembangkan adalah WebGIS fasilitas kesehatan Kabupaten Purworejo. Sistem ini bertujuan menampilkan persebaran fasilitas kesehatan dalam bentuk peta interaktif sehingga pengguna dapat melihat lokasi, membaca atribut, memfilter jenis fasilitas, mencari data, membuat rute, dan melihat ringkasan statistik.

Sistem juga menyediakan halaman admin untuk pengelolaan data. Data yang dikelola tidak hanya berupa atribut, tetapi juga koordinat spasial. Oleh karena itu, database yang digunakan adalah PostgreSQL dengan ekstensi PostGIS.

## 2. Software Development Lifecycle yang Dipilih

Model SDLC yang dipilih adalah Prototype. Model ini sesuai karena sistem WebGIS membutuhkan proses uji tampilan dan interaksi secara bertahap. Peta, simbol, filter, popup, dan form admin dapat dibuat dalam bentuk awal terlebih dahulu, kemudian diperbaiki setelah diuji.

### a. Analisis Kebutuhan

Tahap ini dilakukan dengan mengidentifikasi kebutuhan utama sistem. Website harus memiliki peta interaktif, minimal dua jenis user, login admin, serta database untuk menyimpan data termasuk data geospasial.

### b. Perancangan Cepat

Pada tahap ini dibuat struktur halaman website, yaitu beranda, peta, data, login, admin, dan laporan. Selain itu, dirancang juga struktur database yang memuat tabel pengguna, fasilitas kesehatan, batas wilayah, dan log aktivitas.

### c. Pembuatan Prototype

Prototype dibuat menggunakan HTML, CSS, JavaScript, Leaflet, PHP, dan PostgreSQL/PostGIS. Halaman peta dibuat interaktif dengan fitur layer, filter, popup, pencarian, rute, buffer, dan statistik.

### d. Evaluasi Prototype

Prototype diuji dengan melihat apakah peta dapat menampilkan data, apakah filter bekerja, apakah popup muncul, apakah admin dapat login, serta apakah data dapat ditambah, diubah, dan dihapus.

### e. Implementasi dan Dokumentasi

Tahap akhir dilakukan dengan menyusun file project, file SQL database, serta dokumentasi cara menjalankan website. Dokumentasi dibuat agar sistem dapat diuji kembali dan dikembangkan lebih lanjut.

## 3. Jenis User

Sistem memiliki dua jenis user utama. Pertama, pengguna umum yang dapat membuka peta, mencari lokasi, melihat atribut, memfilter data, membuat rute, dan mengekspor CSV tanpa login. Kedua, admin yang perlu login untuk mengelola data fasilitas kesehatan. Selain itu, role operator juga disiapkan untuk pengembangan lanjutan.

## 4. Basis Data

Database menggunakan PostgreSQL/PostGIS. Tabel utama yang digunakan adalah app_users untuk menyimpan data user, fasilitas_kesehatan untuk menyimpan atribut dan titik koordinat fasilitas, wilayah_administrasi untuk menyimpan batas wilayah, dan activity_logs untuk menyimpan riwayat aktivitas.

Kolom geometri pada tabel fasilitas_kesehatan menggunakan tipe `geometry(Point, 4326)`, sedangkan batas wilayah menggunakan tipe `geometry(MultiPolygon, 4326)`. Dengan tipe data tersebut, data spasial dapat digunakan untuk visualisasi peta dan pengembangan analisis spasial.

## 5. Kesimpulan

Website ini sudah memenuhi kebutuhan utama tugas karena menerapkan SDLC Prototype, memiliki lebih dari satu jenis user, menyediakan login admin, dan memakai database PostgreSQL/PostGIS untuk menyimpan data spasial. Website juga dibuat lebih interaktif melalui fitur peta, filter, popup, rute, buffer, statistik, dan pengelolaan data.
