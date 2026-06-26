-- Query cek setelah import database
SELECT * FROM v_ringkasan_jenis;
SELECT * FROM v_ringkasan_kecamatan;
SELECT geojson FROM v_fasilitas_geojson;

-- Fasilitas terdekat dari pusat Purworejo
SELECT * FROM f_fasilitas_terdekat(110.009, -7.713, 5);

-- Fasilitas dalam radius 3 km dari fasilitas id 1
SELECT * FROM f_radius_layanan(1, 3000);
