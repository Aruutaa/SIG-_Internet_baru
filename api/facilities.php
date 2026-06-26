<?php
require_once 'config.php';
require_once 'helpers.php';
try {
    $pdo = db();
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'GET') {
        $sql = "SELECT f.id, f.kode_faskes AS kode, f.nama, jf.nama_jenis AS jenis, f.kecamatan, f.desa, f.alamat, f.telepon, f.jam_operasional AS jam, f.bpjs, f.igd_24_jam AS igd, f.rawat_inap, f.ambulans, f.kapasitas_tempat_tidur AS bed, f.jumlah_dokter AS dokter, f.jumlah_tenaga_kesehatan AS tenaga, f.status_akreditasi AS akreditasi, f.status_operasional AS operasional, f.rating, ST_Y(f.geom) AS lat, ST_X(f.geom) AS lng, f.updated_at::date::text AS updated_at, COALESCE(array_agg(l.nama_layanan) FILTER (WHERE l.nama_layanan IS NOT NULL), '{}') AS layanan FROM fasilitas_kesehatan f JOIN jenis_fasilitas jf ON jf.id = f.jenis_id LEFT JOIN fasilitas_layanan fl ON fl.fasilitas_id = f.id LEFT JOIN layanan_kesehatan l ON l.id = fl.layanan_id GROUP BY f.id, jf.nama_jenis ORDER BY f.updated_at DESC, f.nama";
        json_response(['success'=>true, 'data'=>$pdo->query($sql)->fetchAll()]);
    }
    $data = body_json();
    if ($method === 'POST' || $method === 'PUT') {
        $jenis = $data['jenis'] ?? 'Klinik';
        $jenisStmt = $pdo->prepare("SELECT id FROM jenis_fasilitas WHERE nama_jenis = :jenis");
        $jenisStmt->execute([':jenis'=>$jenis]);
        $jenisId = $jenisStmt->fetchColumn() ?: 3;
        $params = [
            ':kode'=>$data['kode'] ?? ('FS-' . time()), ':nama'=>$data['nama'] ?? '', ':jenis_id'=>$jenisId, ':kecamatan'=>$data['kecamatan'] ?? '', ':desa'=>$data['desa'] ?? '-', ':alamat'=>$data['alamat'] ?? '', ':telepon'=>$data['telepon'] ?? '', ':jam'=>$data['jam'] ?? '', ':bpjs'=>!empty($data['bpjs']) ? 't':'f', ':igd'=>!empty($data['igd']) ? 't':'f', ':rawat_inap'=>!empty($data['rawat_inap']) ? 't':'f', ':ambulans'=>!empty($data['ambulans']) ? 't':'f', ':bed'=>(int)($data['bed'] ?? 0), ':dokter'=>(int)($data['dokter'] ?? 0), ':tenaga'=>(int)($data['tenaga'] ?? 0), ':rating'=>(float)($data['rating'] ?? 0), ':lng'=>(float)($data['lng'] ?? 110.009), ':lat'=>(float)($data['lat'] ?? -7.713)
        ];
        if ($method === 'POST') {
            $sql = "INSERT INTO fasilitas_kesehatan(kode_faskes,nama,jenis_id,kecamatan,desa,alamat,telepon,jam_operasional,bpjs,igd_24_jam,rawat_inap,ambulans,kapasitas_tempat_tidur,jumlah_dokter,jumlah_tenaga_kesehatan,rating,geom) VALUES(:kode,:nama,:jenis_id,:kecamatan,:desa,:alamat,:telepon,:jam,:bpjs,:igd,:rawat_inap,:ambulans,:bed,:dokter,:tenaga,:rating,ST_SetSRID(ST_MakePoint(:lng,:lat),4326)) RETURNING id";
        } else {
            $params[':id'] = (int)($data['id'] ?? 0);
            $sql = "UPDATE fasilitas_kesehatan SET kode_faskes=:kode,nama=:nama,jenis_id=:jenis_id,kecamatan=:kecamatan,desa=:desa,alamat=:alamat,telepon=:telepon,jam_operasional=:jam,bpjs=:bpjs,igd_24_jam=:igd,rawat_inap=:rawat_inap,ambulans=:ambulans,kapasitas_tempat_tidur=:bed,jumlah_dokter=:dokter,jumlah_tenaga_kesehatan=:tenaga,rating=:rating,geom=ST_SetSRID(ST_MakePoint(:lng,:lat),4326),updated_at=now() WHERE id=:id RETURNING id";
        }
        $stmt = $pdo->prepare($sql); $stmt->execute($params);
        json_response(['success'=>true, 'id'=>$stmt->fetchColumn()]);
    }
    if ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM fasilitas_kesehatan WHERE id = :id");
        $stmt->execute([':id'=>$id]);
        json_response(['success'=>true]);
    }
} catch(Exception $e) { json_response(['success'=>false, 'message'=>$e->getMessage()], 500); }
?>
