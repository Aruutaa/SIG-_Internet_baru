<?php
require_once __DIR__ . '/config.php';
$total = $pdo->query("SELECT COUNT(*) FROM fasilitas_kesehatan WHERE deleted_at IS NULL")->fetchColumn();
$jenis = $pdo->query("SELECT jenis_faskes, COUNT(*) AS total FROM fasilitas_kesehatan WHERE deleted_at IS NULL GROUP BY jenis_faskes ORDER BY jenis_faskes")->fetchAll();
$kec = $pdo->query("SELECT kecamatan, COUNT(*) AS total FROM fasilitas_kesehatan WHERE deleted_at IS NULL GROUP BY kecamatan ORDER BY total DESC, kecamatan")->fetchAll();
json_out(['total'=>(int)$total, 'by_type'=>$jenis, 'by_kecamatan'=>$kec]);
?>
