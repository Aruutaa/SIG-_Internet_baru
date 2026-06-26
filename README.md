# GeoHealth Purworejo - Revisi OSM 3D dan Developer Console

Struktur website:
- `index.html` halaman utama yang lebih formal.
- `map.html` peta interaktif fasilitas kesehatan dengan OSM 3D Buildings.
- `data.html` katalog data dan tabel atribut.
- `login.html` login dan buat akun.
- `admin.html` Developer Console untuk edit data fasilitas.
- `laporan.html` penjelasan SDLC, database, user, dan analisis.

Revisi utama:
1. Tampilan web dibuat lebih formal, tidak memakai gaya kalimat promosi berlebihan.
2. Layer bangunan menggunakan OSM 3D Buildings pada halaman peta.
3. Halaman admin diubah menjadi Developer Console dengan struktur fullstack: form CRUD, peta koordinat, tabel data, dan ringkasan arsitektur.
4. Database tetap mendukung atribut fasilitas kesehatan: IGD, jam operasional IGD, dokter, rawat jalan/inap, dan konsultasi penyakit dalam.
5. Disediakan tabel `osm_3d_building_layer` sebagai cache opsional jika data bangunan OpenStreetMap ingin disimpan ke PostGIS.

Cara menjalankan:
```bash
php -S localhost:8000
```
Buka `http://localhost:8000/index.html`.

Akun demo:
- Email: `admin@webgis.local`
- Password: `admin123`

Import database melalui pgAdmin Query Tool menggunakan:
`database/schema_postgresql.sql`
