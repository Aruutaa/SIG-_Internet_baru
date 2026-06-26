# GeoHealth Purworejo - Fullstack WebGIS Kesehatan

Paket ini berisi WebGIS fasilitas kesehatan Kabupaten Purworejo dengan tampilan Toy Story color system dan pola katalog data yang menampilkan kategori, pencarian, sortir, kartu data, peta interaktif, dashboard admin, serta dokumentasi SDLC.

## Struktur halaman

- `index.html` : beranda dan ringkasan tujuan sistem.
- `map.html` : peta interaktif, filter, popup, radius, fasilitas terdekat, grafik, ekspor CSV, dan cetak peta.
- `data.html` : katalog data dengan kategori, pencarian, sortir, dan kartu fasilitas.
- `login.html` : halaman login admin.
- `admin.html` : dashboard kelola data fasilitas kesehatan.
- `laporan.html` : uraian SDLC, kelas user, database, analisis, dan pengujian.

## Database

File database utama:

`database/schema_postgresql.sql`

Jalankan melalui pgAdmin:

1. Buat database baru, misalnya `geohealth_purworejo`.
2. Buka database tersebut.
3. Pilih `Tools > Query Tool`.
4. Buka file `database/schema_postgresql.sql`.
5. Klik `Execute` atau tekan `F5`.

Tabel utama:

- `app_users`
- `jenis_fasilitas`
- `layanan_kesehatan`
- `wilayah_administrasi`
- `fasilitas_kesehatan`
- `fasilitas_layanan`
- `kunjungan_bulanan`
- `activity_logs`

View dan fungsi analisis:

- `v_fasilitas_geojson`
- `v_ringkasan_jenis`
- `v_ringkasan_kecamatan`
- `f_fasilitas_terdekat(lon, lat, limit)`
- `f_radius_layanan(fasilitas_id, radius_meter)`

## Menjalankan web

Dari folder project:

```bash
php -S localhost:8000
```

Buka:

```text
http://localhost:8000/index.html
```

## Koneksi database

Edit file:

`api/config.php`

Sesuaikan:

```php
$DB_NAME = 'geohealth_purworejo';
$DB_USER = 'postgres';
$DB_PASS = 'postgres123';
```

## Akun awal

```text
Email    : admin@webgis.local
Password : admin123
```

## Catatan data

Data awal disiapkan untuk kebutuhan pengujian sistem. Koordinat dan atribut dapat diganti dengan hasil survei atau sumber resmi sebelum digunakan sebagai data final.
