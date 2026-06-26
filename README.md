# GeoHealth Purworejo - Final Script

Versi final untuk dibuka di VS Code/Live Server.

## Perbaikan utama

1. Gambar dashboard sudah dimasukkan ke `assets/img/dashboard-rs.jpg` dan dipanggil langsung pada `index.html`.
2. Layer bangunan digitasi diganti menjadi OSM 3D Buildings pada `map.html` dan halaman Developer Console.
3. Tombol `Mode 3D OSM` ditambahkan pada sidebar peta. Gunakan tombol ini agar peta otomatis masuk ke zoom 17, karena bangunan 3D baru terlihat jelas pada zoom 16 ke atas.
4. Halaman Developer Console tetap formal dan terstruktur untuk CRUD data fasilitas kesehatan.

## Cara menjalankan

Gunakan Live Server di VS Code atau jalankan:

```bash
php -S localhost:8000
```

Buka:

```text
http://localhost:8000/index.html
```

## Catatan OSM 3D

OSM 3D Buildings membutuhkan koneksi internet karena mengambil library dan tile dari CDN. Jika belum muncul:

1. Pastikan internet aktif.
2. Buka `map.html`.
3. Aktifkan checklist `OSM 3D Buildings`.
4. Klik `Mode 3D OSM`.
5. Tunggu beberapa detik pada zoom 16-18.

Jika wilayah yang dibuka belum memiliki data bangunan pada OpenStreetMap, layer 3D bisa tampak kosong meskipun script sudah benar.

## Database

File SQL ada di:

```text
database/schema_postgresql.sql
```

Import lewat pgAdmin Query Tool bila ingin memakai mode database penuh.
