# Cara Import Database PostgreSQL/PostGIS

1. Buat database baru, misalnya `webgis_purworejo`.
2. Pastikan ekstensi PostGIS tersedia di PostgreSQL.
3. Jalankan file `schema_postgresql.sql` melalui pgAdmin Query Tool atau terminal:

```bash
createdb webgis_purworejo
psql -U postgres -d webgis_purworejo -f database/schema_postgresql.sql
```

4. Sesuaikan koneksi database pada `api/config.php` atau gunakan environment variable:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

Akun login awal:
- Admin: `admin@webgis.local` / `admin123`
- Operator: `operator@webgis.local` / `operator123`

Catatan: jika website dibuka tanpa server PHP atau database, frontend tetap memakai file GeoJSON statis pada `assets/geojson` sebagai fallback. Namun fitur simpan permanen hanya aktif jika API dan database berjalan.
