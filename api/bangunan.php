<?php
require_once __DIR__ . '/config.php';
$sql = "SELECT id, id_faskes, kode_bangunan, nama_bangunan, nama_faskes, jenis_bangunan, jenis_faskes, kecamatan, luas_m2, jumlah_lantai, sumber_digitasi, catatan, ST_AsGeoJSON(geom)::json AS geometry FROM bangunan_digitasi ORDER BY kode_bangunan";
$rows = $pdo->query($sql)->fetchAll();
$features = array_map(function($r){$geom=$r['geometry']; unset($r['geometry']); return ['type'=>'Feature','geometry'=>$geom,'properties'=>$r];}, $rows);
json_out(['type'=>'FeatureCollection','features'=>$features]);
?>