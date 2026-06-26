<?php
require_once __DIR__ . '/config.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT id, nama_faskes, jenis_faskes, kecamatan, alamat, sumber_data, catatan,
                   ST_Y(geom) AS latitude, ST_X(geom) AS longitude, ST_AsGeoJSON(geom)::json AS geometry
            FROM fasilitas_kesehatan WHERE deleted_at IS NULL ORDER BY jenis_faskes, nama_faskes";
    $rows = $pdo->query($sql)->fetchAll();
    $features = array_map(function($r){
        $geom = $r['geometry']; unset($r['geometry']);
        return ['type'=>'Feature', 'geometry'=>$geom, 'properties'=>$r];
    }, $rows);
    json_out(['type'=>'FeatureCollection', 'features'=>$features]);
}

if ($method === 'POST') {
    require_admin();
    $d = input_json();
    $stmt = $pdo->prepare("INSERT INTO fasilitas_kesehatan
        (nama_faskes, jenis_faskes, kecamatan, alamat, sumber_data, catatan, geom, created_by)
        VALUES (:nama, :jenis, :kecamatan, :alamat, :sumber, :catatan, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :created_by)
        RETURNING id");
    $stmt->execute([
        'nama'=>$d['nama_faskes'] ?? '', 'jenis'=>$d['jenis_faskes'] ?? 'Lainnya', 'kecamatan'=>$d['kecamatan'] ?? '',
        'alamat'=>$d['alamat'] ?? '', 'sumber'=>$d['sumber_data'] ?? 'Input Admin', 'catatan'=>$d['catatan'] ?? '',
        'lng'=>(float)($d['longitude'] ?? 0), 'lat'=>(float)($d['latitude'] ?? 0), 'created_by'=>$_SESSION['user']['id']
    ]);
    json_out(['message'=>'Data berhasil ditambahkan', 'id'=>$stmt->fetchColumn()], 201);
}

if ($method === 'PUT') {
    require_admin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) json_out(['error'=>'ID data diperlukan'], 422);
    $d = input_json();
    $stmt = $pdo->prepare("UPDATE fasilitas_kesehatan SET
        nama_faskes=:nama, jenis_faskes=:jenis, kecamatan=:kecamatan, alamat=:alamat, sumber_data=:sumber,
        catatan=:catatan, geom=ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), updated_at=NOW()
        WHERE id=:id AND deleted_at IS NULL");
    $stmt->execute([
        'id'=>$id, 'nama'=>$d['nama_faskes'] ?? '', 'jenis'=>$d['jenis_faskes'] ?? 'Lainnya', 'kecamatan'=>$d['kecamatan'] ?? '',
        'alamat'=>$d['alamat'] ?? '', 'sumber'=>$d['sumber_data'] ?? 'Input Admin', 'catatan'=>$d['catatan'] ?? '',
        'lng'=>(float)($d['longitude'] ?? 0), 'lat'=>(float)($d['latitude'] ?? 0)
    ]);
    json_out(['message'=>'Data berhasil diperbarui']);
}

if ($method === 'DELETE') {
    require_admin();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) json_out(['error'=>'ID data diperlukan'], 422);
    $stmt = $pdo->prepare('UPDATE fasilitas_kesehatan SET deleted_at = NOW() WHERE id = :id');
    $stmt->execute(['id'=>$id]);
    json_out(['message'=>'Data berhasil dihapus']);
}
json_out(['error'=>'Metode tidak didukung'], 405);
?>
