<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$DB_HOST = getenv('PGHOST') ?: 'localhost';
$DB_PORT = getenv('PGPORT') ?: '5432';
$DB_NAME = getenv('PGDATABASE') ?: 'webgis_purworejo';
$DB_USER = getenv('PGUSER') ?: 'postgres';
$DB_PASS = getenv('PGPASSWORD') ?: 'postgres';

try {
    $pdo = new PDO("pgsql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Koneksi database gagal', 'detail' => $e->getMessage()]);
    exit;
}

function json_out($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function input_json() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}
function require_admin() {
    if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], ['admin', 'operator'])) {
        json_out(['error' => 'Akses ditolak. Login admin/operator diperlukan.'], 401);
    }
}
?>
