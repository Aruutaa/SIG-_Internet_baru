# Import Database GeoPlay Purworejo

Gunakan pgAdmin Query Tool.

1. Buka pgAdmin.
2. Buat database baru, contoh `webgis_purworejo`.
3. Klik database tersebut.
4. Pilih Tools > Query Tool.
5. Buka file `schema_postgresql.sql`.
6. Klik Execute/F5.
7. Refresh bagian Schemas > public > Tables.

File SQL ini sudah memakai `ST_Force2D` pada geometri batas wilayah sehingga tidak memunculkan error `Geometry has Z dimension but column does not`.

Tabel utama:

- `app_users`
- `fasilitas_kesehatan`
- `wilayah_administrasi`
- `activity_logs`

Akun awal:

```text
admin@webgis.local / admin123
```
