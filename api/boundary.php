<?php
require_once __DIR__ . '/config.php';
$sql = "SELECT id, nama_wilayah, level_wilayah, ST_AsGeoJSON(geom)::json AS geometry FROM wilayah_administrasi ORDER BY id";
$rows = $pdo->query($sql)->fetchAll();
$features = array_map(function($r){$geom=$r['geometry']; unset($r['geometry']); return ['type'=>'Feature','geometry'=>$geom,'properties'=>$r];}, $rows);
json_out(['type'=>'FeatureCollection','features'=>$features]);
?>
