<?php
require_once 'config.php';
require_once 'helpers.php';
try {
    $pdo = db();
    $jenis = $pdo->query("SELECT jf.nama_jenis AS jenis, COUNT(*) AS total FROM fasilitas_kesehatan f JOIN jenis_fasilitas jf ON jf.id=f.jenis_id GROUP BY jf.nama_jenis ORDER BY total DESC")->fetchAll();
    $kecamatan = $pdo->query("SELECT kecamatan, COUNT(*) AS total, COUNT(*) FILTER (WHERE bpjs) AS bpjs, COUNT(*) FILTER (WHERE igd_24_jam) AS igd FROM fasilitas_kesehatan GROUP BY kecamatan ORDER BY total DESC")->fetchAll();
    json_response(['success'=>true, 'jenis'=>$jenis, 'kecamatan'=>$kecamatan]);
} catch(Exception $e) { json_response(['success'=>false, 'message'=>$e->getMessage()], 500); }
?>
