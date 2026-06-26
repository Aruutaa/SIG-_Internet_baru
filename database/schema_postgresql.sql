-- GeoHealth Purworejo - PostgreSQL/PostGIS
-- Jalankan di pgAdmin Query Tool pada database yang sudah dibuat.
CREATE EXTENSION IF NOT EXISTS postgis;

DROP VIEW IF EXISTS v_fasilitas_geojson CASCADE;
DROP VIEW IF EXISTS v_ringkasan_kecamatan CASCADE;
DROP VIEW IF EXISTS v_ringkasan_jenis CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS kunjungan_bulanan CASCADE;
DROP TABLE IF EXISTS fasilitas_layanan CASCADE;
DROP TABLE IF EXISTS fasilitas_kesehatan CASCADE;
DROP TABLE IF EXISTS layanan_kesehatan CASCADE;
DROP TABLE IF EXISTS jenis_fasilitas CASCADE;
DROP TABLE IF EXISTS wilayah_administrasi CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

CREATE TABLE app_users (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('admin','operator')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE jenis_fasilitas (
  id SERIAL PRIMARY KEY,
  nama_jenis VARCHAR(80) UNIQUE NOT NULL,
  warna VARCHAR(20) NOT NULL,
  ikon VARCHAR(40) NOT NULL
);

CREATE TABLE layanan_kesehatan (
  id SERIAL PRIMARY KEY,
  nama_layanan VARCHAR(120) UNIQUE NOT NULL,
  kelompok VARCHAR(80) DEFAULT 'Layanan umum'
);

CREATE TABLE wilayah_administrasi (
  id SERIAL PRIMARY KEY,
  kecamatan VARCHAR(100) UNIQUE NOT NULL,
  jumlah_penduduk INTEGER,
  luas_km2 NUMERIC(10,2),
  geom GEOMETRY(Point, 4326) NOT NULL
);

CREATE TABLE fasilitas_kesehatan (
  id SERIAL PRIMARY KEY,
  kode_faskes VARCHAR(40) UNIQUE NOT NULL,
  nama VARCHAR(180) NOT NULL,
  jenis_id INTEGER NOT NULL REFERENCES jenis_fasilitas(id),
  kecamatan VARCHAR(100) NOT NULL,
  desa VARCHAR(120),
  alamat TEXT,
  telepon VARCHAR(80),
  email VARCHAR(160),
  website VARCHAR(180),
  jam_operasional VARCHAR(120),
  kepemilikan VARCHAR(80) DEFAULT 'Publik/Swasta',
  status_akreditasi VARCHAR(80),
  status_operasional VARCHAR(40) DEFAULT 'Aktif',
  bpjs BOOLEAN DEFAULT FALSE,
  igd_24_jam BOOLEAN DEFAULT FALSE,
  rawat_inap BOOLEAN DEFAULT FALSE,
  ambulans BOOLEAN DEFAULT FALSE,
  kapasitas_tempat_tidur INTEGER DEFAULT 0,
  jumlah_dokter INTEGER DEFAULT 0,
  jumlah_tenaga_kesehatan INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  sumber_data TEXT DEFAULT 'Data awal WebGIS',
  tanggal_validasi DATE DEFAULT CURRENT_DATE,
  geom GEOMETRY(Point, 4326) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fasilitas_layanan (
  fasilitas_id INTEGER REFERENCES fasilitas_kesehatan(id) ON DELETE CASCADE,
  layanan_id INTEGER REFERENCES layanan_kesehatan(id) ON DELETE CASCADE,
  PRIMARY KEY (fasilitas_id, layanan_id)
);

CREATE TABLE kunjungan_bulanan (
  id SERIAL PRIMARY KEY,
  fasilitas_id INTEGER REFERENCES fasilitas_kesehatan(id) ON DELETE CASCADE,
  bulan DATE NOT NULL,
  jumlah_kunjungan INTEGER NOT NULL DEFAULT 0,
  UNIQUE(fasilitas_id, bulan)
);

CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL,
  aksi VARCHAR(80) NOT NULL,
  tabel VARCHAR(80),
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_faskes_geom ON fasilitas_kesehatan USING GIST(geom);
CREATE INDEX idx_wilayah_geom ON wilayah_administrasi USING GIST(geom);
CREATE INDEX idx_faskes_kecamatan ON fasilitas_kesehatan(kecamatan);
CREATE INDEX idx_faskes_jenis ON fasilitas_kesehatan(jenis_id);


INSERT INTO app_users(nama,email,password_hash,role) VALUES ('Administrator','admin@webgis.local','$2y$12$/5eRVh51DgSaDSHQ1QiCTOK9cyBsbwAnWRm2yB7pztSYK50uyQqm.','admin'),('Operator Data','operator@webgis.local','$2y$12$/5eRVh51DgSaDSHQ1QiCTOK9cyBsbwAnWRm2yB7pztSYK50uyQqm.','operator');

INSERT INTO jenis_fasilitas(nama_jenis,warna,ikon) VALUES ('Rumah Sakit','#1e88ff','hospital'),
('Puskesmas','#30a84f','shield-plus'),
('Klinik','#f2b705','clinic'),
('Apotek','#ef3b45','pharmacy'),
('Laboratorium','#7b45d9','flask');

INSERT INTO layanan_kesehatan(nama_layanan,kelompok) VALUES ('IGD 24 Jam','Kedaruratan'),
('Rawat Jalan','Layanan kesehatan'),
('Rawat Inap','Layanan kesehatan'),
('KIA','Layanan kesehatan'),
('Imunisasi','Layanan kesehatan'),
('Gizi','Layanan kesehatan'),
('Farmasi','Layanan kesehatan'),
('Laboratorium','Layanan kesehatan'),
('Radiologi','Layanan kesehatan'),
('Persalinan','Layanan kesehatan'),
('Ambulans','Kedaruratan');

INSERT INTO wilayah_administrasi(kecamatan,jumlah_penduduk,luas_km2,geom) VALUES
('Bagelen',20300,33.70,ST_SetSRID(ST_MakePoint(110.038900,-7.783100),4326)),
('Banyuurip',22600,37.40,ST_SetSRID(ST_MakePoint(110.003833,-7.747333),4326)),
('Bayan',24900,41.10,ST_SetSRID(ST_MakePoint(109.969700,-7.728267),4326)),
('Bener',27200,44.80,ST_SetSRID(ST_MakePoint(110.054400,-7.623200),4326)),
('Bruno',29500,48.50,ST_SetSRID(ST_MakePoint(109.961900,-7.564100),4326)),
('Butuh',31800,52.20,ST_SetSRID(ST_MakePoint(109.900400,-7.753400),4326)),
('Gebang',34100,55.90,ST_SetSRID(ST_MakePoint(109.991300,-7.650800),4326)),
('Grabag',36400,59.60,ST_SetSRID(ST_MakePoint(109.833367,-7.792100),4326)),
('Kaligesing',38700,63.30,ST_SetSRID(ST_MakePoint(110.100500,-7.705500),4326)),
('Kemiri',41000,67.00,ST_SetSRID(ST_MakePoint(109.949700,-7.645900),4326)),
('Kutoarjo',43300,70.70,ST_SetSRID(ST_MakePoint(109.914920,-7.718480),4326)),
('Loano',45600,74.40,ST_SetSRID(ST_MakePoint(110.026700,-7.661800),4326)),
('Ngombol',47900,78.10,ST_SetSRID(ST_MakePoint(109.956800,-7.811900),4326)),
('Pituruh',50200,81.80,ST_SetSRID(ST_MakePoint(109.879900,-7.648300),4326)),
('Purworejo',52500,85.50,ST_SetSRID(ST_MakePoint(110.009767,-7.710367),4326));

INSERT INTO fasilitas_kesehatan(kode_faskes,nama,jenis_id,kecamatan,desa,alamat,telepon,jam_operasional,kepemilikan,status_akreditasi,status_operasional,bpjs,igd_24_jam,rawat_inap,ambulans,kapasitas_tempat_tidur,jumlah_dokter,jumlah_tenaga_kesehatan,rating,geom,updated_at) VALUES
('RS-PWR-001','RSUD dr. Tjitrowardojo',1,'Purworejo','Sindurjan','Jl. Jenderal Sudirman, Purworejo','0275-321118','24 jam','Swasta/Pemerintah','Paripurna','Aktif',TRUE,TRUE,TRUE,TRUE,250,62,410,4.4,ST_SetSRID(ST_MakePoint(110.0098,-7.7146),4326),'2026-06-01'::date),
('RS-PWR-002','RS Palang Biru Kutoarjo',1,'Kutoarjo','Kutoarjo','Kawasan Kutoarjo, Purworejo','0275-641000','24 jam','Swasta/Pemerintah','Utama','Aktif',TRUE,TRUE,TRUE,TRUE,90,28,165,4.2,ST_SetSRID(ST_MakePoint(109.9129,-7.7192),4326),'2026-06-02'::date),
('RS-PWR-003','RSIA Permata Purworejo',1,'Purworejo','Pangenjurutengah','Purworejo Kota','0275-325200','24 jam','Swasta/Pemerintah','Madya','Aktif',FALSE,TRUE,TRUE,TRUE,60,18,98,4.1,ST_SetSRID(ST_MakePoint(110.0132,-7.7068),4326),'2026-06-03'::date),
('PKM-PWR-001','Puskesmas Purworejo',2,'Purworejo','Baledono','Kecamatan Purworejo','0275-321200','Senin-Sabtu 07.30-14.00','Publik','Paripurna','Aktif',TRUE,FALSE,FALSE,TRUE,0,5,39,4.3,ST_SetSRID(ST_MakePoint(110.0062,-7.7111),4326),'2026-06-04'::date),
('PKM-PWR-002','Puskesmas Kutoarjo',2,'Kutoarjo','Semawung Daleman','Kecamatan Kutoarjo','0275-641200','Senin-Sabtu 07.30-14.00','Publik','Utama','Aktif',TRUE,FALSE,TRUE,TRUE,12,6,48,4.2,ST_SetSRID(ST_MakePoint(109.9147,-7.7169),4326),'2026-06-05'::date),
('PKM-PWR-003','Puskesmas Banyuurip',2,'Banyuurip','Banyuurip','Kecamatan Banyuurip','0275-323300','Senin-Sabtu 07.30-14.00','Publik','Utama','Aktif',TRUE,FALSE,FALSE,TRUE,0,4,34,4.0,ST_SetSRID(ST_MakePoint(110.0036,-7.7467),4326),'2026-06-06'::date),
('PKM-PWR-004','Puskesmas Bayan',2,'Bayan','Bayan','Kecamatan Bayan','0275-325600','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,FALSE,TRUE,0,4,32,4.1,ST_SetSRID(ST_MakePoint(109.9728,-7.7258),4326),'2026-06-07'::date),
('PKM-PWR-005','Puskesmas Butuh',2,'Butuh','Butuh','Kecamatan Butuh','0275-641250','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,FALSE,TRUE,0,3,28,3.9,ST_SetSRID(ST_MakePoint(109.9004,-7.7534),4326),'2026-06-08'::date),
('PKM-PWR-006','Puskesmas Grabag',2,'Grabag','Grabag','Kecamatan Grabag','0275-642400','Senin-Sabtu 07.30-14.00','Publik','Utama','Aktif',TRUE,FALSE,FALSE,TRUE,0,4,31,4.0,ST_SetSRID(ST_MakePoint(109.8305,-7.7925),4326),'2026-06-09'::date),
('PKM-PWR-007','Puskesmas Loano',2,'Loano','Loano','Kecamatan Loano','0275-325800','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,FALSE,TRUE,0,3,27,4.0,ST_SetSRID(ST_MakePoint(110.0267,-7.6618),4326),'2026-06-10'::date),
('PKM-PWR-008','Puskesmas Bener',2,'Bener','Bener','Kecamatan Bener','0275-324900','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,FALSE,TRUE,0,3,26,3.9,ST_SetSRID(ST_MakePoint(110.0544,-7.6232),4326),'2026-06-11'::date),
('PKM-PWR-009','Puskesmas Kaligesing',2,'Kaligesing','Kaligesing','Kecamatan Kaligesing','0275-326000','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,FALSE,TRUE,0,3,24,4.0,ST_SetSRID(ST_MakePoint(110.1005,-7.7055),4326),'2026-06-12'::date),
('PKM-PWR-010','Puskesmas Ngombol',2,'Ngombol','Ngombol','Kecamatan Ngombol','0275-323500','Senin-Sabtu 07.30-14.00','Publik','Utama','Aktif',TRUE,FALSE,FALSE,TRUE,0,4,29,4.1,ST_SetSRID(ST_MakePoint(109.9568,-7.8119),4326),'2026-06-13'::date),
('PKM-PWR-011','Puskesmas Bagelen',2,'Bagelen','Bagelen','Kecamatan Bagelen','0275-323900','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,FALSE,TRUE,0,3,25,3.8,ST_SetSRID(ST_MakePoint(110.0389,-7.7831),4326),'2026-06-14'::date),
('PKM-PWR-012','Puskesmas Bruno',2,'Bruno','Bruno','Kecamatan Bruno','0275-324600','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,TRUE,TRUE,10,3,30,3.9,ST_SetSRID(ST_MakePoint(109.9619,-7.5641),4326),'2026-06-15'::date),
('KLI-PWR-001','Klinik Pratama Sehat Purworejo',3,'Purworejo','Baledono','Kawasan Purworejo Kota','0275-321555','08.00-21.00','Swasta/Pemerintah','Terdaftar','Aktif',TRUE,FALSE,FALSE,FALSE,0,3,12,4.5,ST_SetSRID(ST_MakePoint(110.0121,-7.7092),4326),'2026-06-16'::date),
('KLI-PWR-002','Klinik Medika Kutoarjo',3,'Kutoarjo','Kutoarjo','Kawasan Kutoarjo','0275-641388','08.00-20.00','Swasta/Pemerintah','Terdaftar','Aktif',TRUE,FALSE,FALSE,FALSE,0,3,11,4.2,ST_SetSRID(ST_MakePoint(109.9168,-7.7217),4326),'2026-06-17'::date),
('KLI-PWR-003','Klinik Utama Bina Sehat',3,'Banyuurip','Banyuurip','Banyuurip','0275-322919','08.00-20.00','Swasta/Pemerintah','Terdaftar','Aktif',FALSE,FALSE,FALSE,FALSE,0,2,9,4.0,ST_SetSRID(ST_MakePoint(110.0072,-7.7504),4326),'2026-06-18'::date),
('KLI-PWR-004','Klinik Pratama Bayan',3,'Bayan','Bayan','Bayan','0275-325788','08.00-19.00','Swasta/Pemerintah','Terdaftar','Aktif',FALSE,FALSE,FALSE,FALSE,0,2,8,4.0,ST_SetSRID(ST_MakePoint(109.9662,-7.7314),4326),'2026-06-19'::date),
('KLI-PWR-005','Klinik Rawat Jalan Grabag',3,'Grabag','Grabag','Grabag','0275-642111','08.00-18.00','Swasta/Pemerintah','Terdaftar','Aktif',FALSE,FALSE,FALSE,FALSE,0,1,7,3.9,ST_SetSRID(ST_MakePoint(109.8367,-7.7896),4326),'2026-06-20'::date),
('APT-PWR-001','Apotek Farma Purworejo',4,'Purworejo','Baledono','Purworejo Kota','0275-321700','08.00-22.00','Swasta/Pemerintah','Izin Aktif','Aktif',FALSE,FALSE,FALSE,FALSE,0,0,6,4.4,ST_SetSRID(ST_MakePoint(110.0105,-7.7131),4326),'2026-06-01'::date),
('APT-PWR-002','Apotek Kutoarjo Sehat',4,'Kutoarjo','Kutoarjo','Kutoarjo','0275-641555','08.00-22.00','Swasta/Pemerintah','Izin Aktif','Aktif',FALSE,FALSE,FALSE,FALSE,0,0,5,4.2,ST_SetSRID(ST_MakePoint(109.9104,-7.7183),4326),'2026-06-02'::date),
('APT-PWR-003','Apotek Bayan Farma',4,'Bayan','Bayan','Bayan','0275-325777','08.00-21.00','Swasta/Pemerintah','Izin Aktif','Aktif',FALSE,FALSE,FALSE,FALSE,0,0,4,4.1,ST_SetSRID(ST_MakePoint(109.9701,-7.7276),4326),'2026-06-03'::date),
('APT-PWR-004','Apotek Banyuurip Farma',4,'Banyuurip','Banyuurip','Banyuurip','0275-322712','08.00-21.00','Swasta/Pemerintah','Izin Aktif','Aktif',FALSE,FALSE,FALSE,FALSE,0,0,4,4.0,ST_SetSRID(ST_MakePoint(110.0007,-7.7449),4326),'2026-06-04'::date),
('APT-PWR-005','Apotek Grabag Farma',4,'Grabag','Grabag','Grabag','0275-642555','08.00-21.00','Swasta/Pemerintah','Izin Aktif','Aktif',FALSE,FALSE,FALSE,FALSE,0,0,4,3.9,ST_SetSRID(ST_MakePoint(109.8329,-7.7942),4326),'2026-06-05'::date),
('LAB-PWR-001','Laboratorium Klinik Purworejo',5,'Purworejo','Pangenjurutengah','Purworejo Kota','0275-321889','07.00-20.00','Swasta/Pemerintah','Izin Aktif','Aktif',FALSE,FALSE,FALSE,FALSE,0,1,10,4.3,ST_SetSRID(ST_MakePoint(110.0068,-7.7074),4326),'2026-06-06'::date),
('LAB-PWR-002','Laboratorium Kutoarjo Medika',5,'Kutoarjo','Kutoarjo','Kutoarjo','0275-641889','07.00-19.00','Swasta/Pemerintah','Izin Aktif','Aktif',FALSE,FALSE,FALSE,FALSE,0,1,8,4.1,ST_SetSRID(ST_MakePoint(109.9198,-7.7163),4326),'2026-06-07'::date),
('PKM-PWR-013','Puskesmas Kemiri',2,'Kemiri','Kemiri','Kecamatan Kemiri','0275-324788','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,FALSE,TRUE,0,3,25,3.8,ST_SetSRID(ST_MakePoint(109.9497,-7.6459),4326),'2026-06-08'::date),
('PKM-PWR-014','Puskesmas Pituruh',2,'Pituruh','Pituruh','Kecamatan Pituruh','0275-324500','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,FALSE,TRUE,0,3,25,3.8,ST_SetSRID(ST_MakePoint(109.8799,-7.6483),4326),'2026-06-09'::date),
('PKM-PWR-015','Puskesmas Gebang',2,'Gebang','Gebang','Kecamatan Gebang','0275-324300','Senin-Sabtu 07.30-14.00','Publik','Madya','Aktif',TRUE,FALSE,FALSE,TRUE,0,3,26,3.9,ST_SetSRID(ST_MakePoint(109.9913,-7.6508),4326),'2026-06-10'::date);

INSERT INTO fasilitas_layanan(fasilitas_id,layanan_id) VALUES
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='IGD 24 Jam')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Inap')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Laboratorium')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Radiologi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Ambulans')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='IGD 24 Jam')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Inap')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Ambulans')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Persalinan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Inap')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Gizi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Inap')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-004'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-004'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-004'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-005'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-005'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-005'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Gizi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-007'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-007'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-007'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-008'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-008'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-008'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-009'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-009'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-009'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-010'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-010'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-010'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-011'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-011'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-011'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Gizi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-012'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-012'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Inap')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-012'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-004'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-005'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='APT-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='APT-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='APT-PWR-003'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='APT-PWR-004'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='APT-PWR-005'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='LAB-PWR-001'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Laboratorium')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='LAB-PWR-002'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Laboratorium')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-013'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-013'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-013'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-014'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-014'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-014'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Farmasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-015'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Rawat Jalan')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-015'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='Imunisasi')),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-015'),(SELECT id FROM layanan_kesehatan WHERE nama_layanan='KIA')) ON CONFLICT DO NOTHING;

INSERT INTO kunjungan_bulanan(fasilitas_id,bulan,jumlah_kunjungan) VALUES
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),'2026-01-01'::date,2207),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),'2026-02-01'::date,2252),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),'2026-03-01'::date,2297),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),'2026-04-01'::date,2342),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),'2026-05-01'::date,2387),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-001'),'2026-06-01'::date,2432),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),'2026-01-01'::date,2214),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),'2026-02-01'::date,2259),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),'2026-03-01'::date,2304),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),'2026-04-01'::date,2349),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),'2026-05-01'::date,2394),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-002'),'2026-06-01'::date,2439),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),'2026-01-01'::date,2221),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),'2026-02-01'::date,2266),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),'2026-03-01'::date,2311),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),'2026-04-01'::date,2356),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),'2026-05-01'::date,2401),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='RS-PWR-003'),'2026-06-01'::date,2446),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),'2026-01-01'::date,928),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),'2026-02-01'::date,973),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),'2026-03-01'::date,1018),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),'2026-04-01'::date,1063),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),'2026-05-01'::date,1108),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-001'),'2026-06-01'::date,1153),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),'2026-01-01'::date,935),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),'2026-02-01'::date,980),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),'2026-03-01'::date,1025),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),'2026-04-01'::date,1070),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),'2026-05-01'::date,1115),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-002'),'2026-06-01'::date,1160),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),'2026-01-01'::date,942),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),'2026-02-01'::date,987),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),'2026-03-01'::date,1032),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),'2026-04-01'::date,1077),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),'2026-05-01'::date,1122),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-003'),'2026-06-01'::date,1167),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-004'),'2026-01-01'::date,949),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-004'),'2026-02-01'::date,994),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-004'),'2026-03-01'::date,1039),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-004'),'2026-04-01'::date,1084),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-004'),'2026-05-01'::date,1129),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-004'),'2026-06-01'::date,1174),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-005'),'2026-01-01'::date,956),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-005'),'2026-02-01'::date,1001),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-005'),'2026-03-01'::date,1046),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-005'),'2026-04-01'::date,1091),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-005'),'2026-05-01'::date,1136),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-005'),'2026-06-01'::date,1181),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),'2026-01-01'::date,963),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),'2026-02-01'::date,1008),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),'2026-03-01'::date,1053),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),'2026-04-01'::date,1098),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),'2026-05-01'::date,1143),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-006'),'2026-06-01'::date,1188),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-007'),'2026-01-01'::date,970),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-007'),'2026-02-01'::date,1015),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-007'),'2026-03-01'::date,1060),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-007'),'2026-04-01'::date,1105),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-007'),'2026-05-01'::date,1150),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-007'),'2026-06-01'::date,1195),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-008'),'2026-01-01'::date,977),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-008'),'2026-02-01'::date,1022),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-008'),'2026-03-01'::date,1067),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-008'),'2026-04-01'::date,1112),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-008'),'2026-05-01'::date,1157),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-008'),'2026-06-01'::date,1202),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-009'),'2026-01-01'::date,984),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-009'),'2026-02-01'::date,1029),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-009'),'2026-03-01'::date,1074),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-009'),'2026-04-01'::date,1119),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-009'),'2026-05-01'::date,1164),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-009'),'2026-06-01'::date,1209),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-010'),'2026-01-01'::date,991),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-010'),'2026-02-01'::date,1036),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-010'),'2026-03-01'::date,1081),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-010'),'2026-04-01'::date,1126),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-010'),'2026-05-01'::date,1171),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-010'),'2026-06-01'::date,1216),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-011'),'2026-01-01'::date,998),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-011'),'2026-02-01'::date,1043),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-011'),'2026-03-01'::date,1088),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-011'),'2026-04-01'::date,1133),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-011'),'2026-05-01'::date,1178),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-011'),'2026-06-01'::date,1223),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-012'),'2026-01-01'::date,1005),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-012'),'2026-02-01'::date,1050),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-012'),'2026-03-01'::date,1095),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-012'),'2026-04-01'::date,1140),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-012'),'2026-05-01'::date,1185),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='PKM-PWR-012'),'2026-06-01'::date,1230),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-001'),'2026-01-01'::date,392),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-001'),'2026-02-01'::date,437),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-001'),'2026-03-01'::date,482),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-001'),'2026-04-01'::date,527),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-001'),'2026-05-01'::date,572),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-001'),'2026-06-01'::date,617),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-002'),'2026-01-01'::date,399),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-002'),'2026-02-01'::date,444),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-002'),'2026-03-01'::date,489),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-002'),'2026-04-01'::date,534),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-002'),'2026-05-01'::date,579),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-002'),'2026-06-01'::date,624),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-003'),'2026-01-01'::date,406),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-003'),'2026-02-01'::date,451),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-003'),'2026-03-01'::date,496),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-003'),'2026-04-01'::date,541),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-003'),'2026-05-01'::date,586),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-003'),'2026-06-01'::date,631),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-004'),'2026-01-01'::date,413),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-004'),'2026-02-01'::date,458),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-004'),'2026-03-01'::date,503),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-004'),'2026-04-01'::date,548),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-004'),'2026-05-01'::date,593),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-004'),'2026-06-01'::date,638),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-005'),'2026-01-01'::date,420),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-005'),'2026-02-01'::date,465),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-005'),'2026-03-01'::date,510),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-005'),'2026-04-01'::date,555),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-005'),'2026-05-01'::date,600),
((SELECT id FROM fasilitas_kesehatan WHERE kode_faskes='KLI-PWR-005'),'2026-06-01'::date,645) ON CONFLICT DO NOTHING;


CREATE OR REPLACE VIEW v_ringkasan_jenis AS
SELECT jf.nama_jenis AS jenis, jf.warna, COUNT(f.id) AS total,
       COUNT(*) FILTER (WHERE f.bpjs) AS total_bpjs,
       COUNT(*) FILTER (WHERE f.igd_24_jam) AS total_igd,
       SUM(f.kapasitas_tempat_tidur) AS total_bed
FROM jenis_fasilitas jf
LEFT JOIN fasilitas_kesehatan f ON f.jenis_id = jf.id
GROUP BY jf.nama_jenis, jf.warna
ORDER BY total DESC;

CREATE OR REPLACE VIEW v_ringkasan_kecamatan AS
SELECT w.kecamatan, w.jumlah_penduduk, w.luas_km2,
       COUNT(f.id) AS total_fasilitas,
       COUNT(*) FILTER (WHERE jf.nama_jenis = 'Rumah Sakit') AS rumah_sakit,
       COUNT(*) FILTER (WHERE jf.nama_jenis = 'Puskesmas') AS puskesmas,
       COUNT(*) FILTER (WHERE f.bpjs) AS bpjs,
       COUNT(*) FILTER (WHERE f.igd_24_jam) AS igd_24_jam,
       ROUND((COUNT(f.id)::numeric / NULLIF(w.jumlah_penduduk,0)) * 10000, 2) AS rasio_per_10000_penduduk,
       ST_AsGeoJSON(w.geom)::json AS geometry
FROM wilayah_administrasi w
LEFT JOIN fasilitas_kesehatan f ON f.kecamatan = w.kecamatan
LEFT JOIN jenis_fasilitas jf ON jf.id = f.jenis_id
GROUP BY w.id
ORDER BY total_fasilitas DESC;

CREATE OR REPLACE VIEW v_fasilitas_geojson AS
SELECT json_build_object(
  'type', 'FeatureCollection',
  'features', COALESCE(json_agg(json_build_object(
    'type','Feature',
    'geometry', ST_AsGeoJSON(f.geom)::json,
    'properties', json_build_object(
      'id', f.id,
      'kode', f.kode_faskes,
      'nama', f.nama,
      'jenis', jf.nama_jenis,
      'kecamatan', f.kecamatan,
      'desa', f.desa,
      'alamat', f.alamat,
      'telepon', f.telepon,
      'jam', f.jam_operasional,
      'bpjs', f.bpjs,
      'igd', f.igd_24_jam,
      'rawat_inap', f.rawat_inap,
      'ambulans', f.ambulans,
      'bed', f.kapasitas_tempat_tidur,
      'dokter', f.jumlah_dokter,
      'tenaga', f.jumlah_tenaga_kesehatan,
      'rating', f.rating
    )
  )), '[]'::json)
) AS geojson
FROM fasilitas_kesehatan f
JOIN jenis_fasilitas jf ON jf.id = f.jenis_id;

CREATE OR REPLACE FUNCTION f_fasilitas_terdekat(p_lon DOUBLE PRECISION, p_lat DOUBLE PRECISION, p_limit INTEGER DEFAULT 5)
RETURNS TABLE(id INTEGER, nama VARCHAR, jenis VARCHAR, kecamatan VARCHAR, jarak_meter DOUBLE PRECISION) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.nama, jf.nama_jenis, f.kecamatan,
         ST_DistanceSphere(f.geom, ST_SetSRID(ST_MakePoint(p_lon,p_lat),4326)) AS jarak_meter
  FROM fasilitas_kesehatan f
  JOIN jenis_fasilitas jf ON jf.id = f.jenis_id
  ORDER BY f.geom <-> ST_SetSRID(ST_MakePoint(p_lon,p_lat),4326)
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION f_radius_layanan(p_fasilitas_id INTEGER, p_radius_meter DOUBLE PRECISION DEFAULT 3000)
RETURNS TABLE(id INTEGER, nama VARCHAR, jenis VARCHAR, kecamatan VARCHAR, jarak_meter DOUBLE PRECISION) AS $$
BEGIN
  RETURN QUERY
  WITH pusat AS (SELECT geom FROM fasilitas_kesehatan WHERE fasilitas_kesehatan.id = p_fasilitas_id)
  SELECT f.id, f.nama, jf.nama_jenis, f.kecamatan, ST_DistanceSphere(f.geom, pusat.geom) AS jarak_meter
  FROM fasilitas_kesehatan f
  JOIN jenis_fasilitas jf ON jf.id = f.jenis_id
  CROSS JOIN pusat
  WHERE ST_DWithin(f.geom::geography, pusat.geom::geography, p_radius_meter)
  ORDER BY jarak_meter;
END;
$$ LANGUAGE plpgsql;

SELECT 'Database GeoHealth Purworejo berhasil dibuat' AS status,
       (SELECT COUNT(*) FROM fasilitas_kesehatan) AS total_fasilitas,
       (SELECT COUNT(*) FROM jenis_fasilitas) AS total_jenis,
       (SELECT COUNT(*) FROM layanan_kesehatan) AS total_layanan;
