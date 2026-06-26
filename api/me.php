<?php
require_once __DIR__ . '/config.php';
json_out(['authenticated' => isset($_SESSION['user']), 'user' => $_SESSION['user'] ?? null]);
?>
