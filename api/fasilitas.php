<?php
require_once __DIR__ . '/config.php';
$method = $_SERVER['REQUEST_METHOD'];
function bool_param($value) { return !empty($value) && $value !== 'false' && $value !== '0' ? 't' : 'f'; }
if ($method === 'GET') {
    $sql = "SELECT id, nama_faskes, jenis_faskes, kecamatan, alamat, sumber_data, catatan,
                   status_operasional, telepon, website, jam_layanan,
                   bpjs, igd_24_jam, igd_jam_operasional, rawat_jalan, rawat_inap, ambulans,
                   kapasitas_tempat_tidur, jumlah_dokter, jumlah_dokter_umum, jumlah_dokter_spesialis,
                   dokter_penyakit_dalam, konsultasi_penyakit_dalam, jadwal_penyakit_dalam,
                   jumlah_tenaga_kesehatan, rating,
                   ST_Y(geom) AS latitude, ST_X(geom) AS longitude, ST_AsGeoJSON(geom)::json AS geometry
            FROM fasilitas_kesehatan WHERE deleted_at IS NULL ORDER BY jenis_faskes, nama_faskes";
    $rows = $pdo->query($sql)->fetchAll();
    $features = array_map(function($r){$geom=$r['geometry']; unset($r['geometry']); return ['type'=>'Feature', 'geometry'=>$geom, 'properties'=>$r];}, $rows);
    json_out(['type'=>'FeatureCollection', 'features'=>$features]);
}
if ($method === 'POST') {
    require_admin(); $d = input_json();
    $stmt = $pdo->prepare("INSERT INTO fasilitas_kesehatan
        (nama_faskes, jenis_faskes, kecamatan, alamat, sumber_data, catatan, status_operasional, telepon, jam_layanan, bpjs, igd_24_jam, igd_jam_operasional, rawat_jalan, rawat_inap, ambulans, kapasitas_tempat_tidur, jumlah_dokter, jumlah_dokter_umum, jumlah_dokter_spesialis, dokter_penyakit_dalam, konsultasi_penyakit_dalam, jadwal_penyakit_dalam, jumlah_tenaga_kesehatan, rating, geom, created_by)
        VALUES (:nama, :jenis, :kecamatan, :alamat, :sumber, :catatan, :status, :telepon, :jam, :bpjs, :igd, :igd_jam, :rawat_jalan, :rawat_inap, :ambulans, :bed, :dokter, :dokter_umum, :dokter_spesialis, :dokter_pd, :konsul_pd, :jadwal_pd, :tenaga, :rating, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :created_by)
        RETURNING id");
    $stmt->execute(['nama'=>$d['nama_faskes'] ?? '', 'jenis'=>$d['jenis_faskes'] ?? 'Lainnya', 'kecamatan'=>$d['kecamatan'] ?? '', 'alamat'=>$d['alamat'] ?? '', 'sumber'=>$d['sumber_data'] ?? 'Input Admin', 'catatan'=>$d['catatan'] ?? '', 'status'=>$d['status_operasional'] ?? 'Aktif', 'telepon'=>$d['telepon'] ?? '-', 'jam'=>$d['jam_layanan'] ?? '', 'bpjs'=>bool_param($d['bpjs'] ?? false), 'igd'=>bool_param($d['igd_24_jam'] ?? false), 'igd_jam'=>$d['igd_jam_operasional'] ?? '', 'rawat_jalan'=>bool_param($d['rawat_jalan'] ?? true), 'rawat_inap'=>bool_param($d['rawat_inap'] ?? false), 'ambulans'=>bool_param($d['ambulans'] ?? false), 'bed'=>(int)($d['kapasitas_tempat_tidur'] ?? 0), 'dokter'=>(int)($d['jumlah_dokter'] ?? 0), 'dokter_umum'=>(int)($d['jumlah_dokter_umum'] ?? 0), 'dokter_spesialis'=>(int)($d['jumlah_dokter_spesialis'] ?? 0), 'dokter_pd'=>(int)($d['dokter_penyakit_dalam'] ?? 0), 'konsul_pd'=>bool_param($d['konsultasi_penyakit_dalam'] ?? false), 'jadwal_pd'=>$d['jadwal_penyakit_dalam'] ?? '', 'tenaga'=>(int)($d['jumlah_tenaga_kesehatan'] ?? 0), 'rating'=>(float)($d['rating'] ?? 0), 'lng'=>(float)($d['longitude'] ?? 0), 'lat'=>(float)($d['latitude'] ?? 0), 'created_by'=>$_SESSION['user']['id']]);
    json_out(['message'=>'Data berhasil ditambahkan', 'id'=>$stmt->fetchColumn()], 201);
}
if ($method === 'PUT') {
    require_admin(); $id=(int)($_GET['id'] ?? 0); if(!$id) json_out(['error'=>'ID data diperlukan'],422); $d=input_json();
    $stmt=$pdo->prepare("UPDATE fasilitas_kesehatan SET nama_faskes=:nama, jenis_faskes=:jenis, kecamatan=:kecamatan, alamat=:alamat, sumber_data=:sumber, catatan=:catatan, status_operasional=:status, telepon=:telepon, jam_layanan=:jam, bpjs=:bpjs, igd_24_jam=:igd, igd_jam_operasional=:igd_jam, rawat_jalan=:rawat_jalan, rawat_inap=:rawat_inap, ambulans=:ambulans, kapasitas_tempat_tidur=:bed, jumlah_dokter=:dokter, jumlah_dokter_umum=:dokter_umum, jumlah_dokter_spesialis=:dokter_spesialis, dokter_penyakit_dalam=:dokter_pd, konsultasi_penyakit_dalam=:konsul_pd, jadwal_penyakit_dalam=:jadwal_pd, jumlah_tenaga_kesehatan=:tenaga, rating=:rating, geom=ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), updated_at=NOW() WHERE id=:id AND deleted_at IS NULL");
    $stmt->execute(['id'=>$id, 'nama'=>$d['nama_faskes'] ?? '', 'jenis'=>$d['jenis_faskes'] ?? 'Lainnya', 'kecamatan'=>$d['kecamatan'] ?? '', 'alamat'=>$d['alamat'] ?? '', 'sumber'=>$d['sumber_data'] ?? 'Input Admin', 'catatan'=>$d['catatan'] ?? '', 'status'=>$d['status_operasional'] ?? 'Aktif', 'telepon'=>$d['telepon'] ?? '-', 'jam'=>$d['jam_layanan'] ?? '', 'bpjs'=>bool_param($d['bpjs'] ?? false), 'igd'=>bool_param($d['igd_24_jam'] ?? false), 'igd_jam'=>$d['igd_jam_operasional'] ?? '', 'rawat_jalan'=>bool_param($d['rawat_jalan'] ?? true), 'rawat_inap'=>bool_param($d['rawat_inap'] ?? false), 'ambulans'=>bool_param($d['ambulans'] ?? false), 'bed'=>(int)($d['kapasitas_tempat_tidur'] ?? 0), 'dokter'=>(int)($d['jumlah_dokter'] ?? 0), 'dokter_umum'=>(int)($d['jumlah_dokter_umum'] ?? 0), 'dokter_spesialis'=>(int)($d['jumlah_dokter_spesialis'] ?? 0), 'dokter_pd'=>(int)($d['dokter_penyakit_dalam'] ?? 0), 'konsul_pd'=>bool_param($d['konsultasi_penyakit_dalam'] ?? false), 'jadwal_pd'=>$d['jadwal_penyakit_dalam'] ?? '', 'tenaga'=>(int)($d['jumlah_tenaga_kesehatan'] ?? 0), 'rating'=>(float)($d['rating'] ?? 0), 'lng'=>(float)($d['longitude'] ?? 0), 'lat'=>(float)($d['latitude'] ?? 0)]);
    json_out(['message'=>'Data berhasil diperbarui']);
}
if ($method === 'DELETE') { require_admin(); $id=(int)($_GET['id'] ?? 0); if(!$id) json_out(['error'=>'ID data diperlukan'],422); $stmt=$pdo->prepare('UPDATE fasilitas_kesehatan SET deleted_at = NOW() WHERE id = :id'); $stmt->execute(['id'=>$id]); json_out(['message'=>'Data berhasil dihapus']); }
json_out(['error'=>'Metode tidak didukung'], 405);
?>
