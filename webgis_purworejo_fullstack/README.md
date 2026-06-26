# GeoHealth Purworejo — Fullstack WebGIS

Website ini adalah rancangan ulang WebGIS fasilitas kesehatan Kabupaten Purworejo. Sistem dibuat untuk memenuhi instruksi tugas: menggunakan SDLC, memiliki minimal dua jenis user, menyediakan login admin, dan memakai basis data PostgreSQL/PostGIS untuk menyimpan data spasial.

## Struktur Folder

```text
webgis_purworejo_fullstack/
├── index.html              # Landing page
├── map.html                # Peta interaktif
├── data.html               # Katalog data atribut
├── login.html              # Login admin/operator
├── admin.html              # Dashboard kelola data
├── laporan.html            # Ringkasan laporan sistem dan SDLC
├── assets/
│   ├── css/                # Style website
│   ├── js/                 # Script frontend
│   ├── img/                # Gambar pendukung
│   └── geojson/            # Fallback data spasial
├── api/                    # API PHP untuk PostgreSQL/PostGIS
├── database/               # File SQL database
└── docs/                   # Dokumentasi laporan
```

## Cara Menjalankan

1. Import database dari `database/schema_postgresql.sql`.
2. Sesuaikan koneksi database di `api/config.php`.
3. Jalankan server lokal dari folder project:

```bash
php -S localhost:8000
```

4. Buka `http://localhost:8000/index.html`.
5. Login admin melalui `login.html`.

Akun awal:
- Admin: `admin@webgis.local` / `admin123`
- Operator: `operator@webgis.local` / `operator123`

## Fitur

- Peta interaktif berbasis Leaflet.
- Layer batas Kabupaten Purworejo dan titik fasilitas kesehatan.
- Basemap OpenStreetMap, Carto Light, dan Esri Imagery.
- Filter jenis fasilitas dan kecamatan.
- Pencarian nama, jenis, kecamatan, dan alamat.
- Popup atribut dan tautan Google Maps.
- Buffer radius 1 km.
- Pencarian fasilitas terdekat dari lokasi pengguna.
- Rute dari lokasi pengguna ke fasilitas terpilih.
- Statistik dan grafik jenis fasilitas.
- Ekspor data CSV.
- Login admin/operator.
- Tambah, edit, dan hapus data melalui dashboard admin.
- PostgreSQL/PostGIS sebagai basis data spasial.

## SDLC yang Digunakan

Model yang digunakan adalah Prototype. Penjelasan tahapan tersedia pada `laporan.html` dan `docs/laporan_tahapan_sdlc.md`.
