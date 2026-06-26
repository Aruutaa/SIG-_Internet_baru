<?php
require_once __DIR__ . '/config.php';
$sql = "SELECT id, osm_id, nama_bangunan, fungsi_bangunan, tinggi_m, jumlah_lantai, sumber_data, tanggal_sinkron, ST_AsGeoJSON(geom)::json AS geometry FROM osm_3d_building_layer ORDER BY id";
$rows = $pdo->query($sql)->fetchAll();
$features = array_map(function($r){$geom=$r['geometry']; unset($r['geometry']); return ['type'=>'Feature','geometry'=>$geom,'properties'=>$r];}, $rows);
json_out(['type'=>'FeatureCollection','features'=>$features]);
?>