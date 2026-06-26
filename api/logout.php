<?php
require_once __DIR__ . '/config.php';
$_SESSION = [];
session_destroy();
json_out(['message' => 'Logout berhasil']);
?>
