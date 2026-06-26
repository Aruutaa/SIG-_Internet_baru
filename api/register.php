<?php
require_once __DIR__ . '/config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error'=>'Metode tidak didukung'], 405);
$d = input_json();
$name = trim($d['name'] ?? '');
$email = strtolower(trim($d['email'] ?? ''));
$password = $d['password'] ?? '';
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
    json_out(['error'=>'Nama, email valid, dan password minimal 6 karakter diperlukan.'], 422);
}
$stmt = $pdo->prepare('SELECT id FROM app_users WHERE email = :email LIMIT 1');
$stmt->execute(['email'=>$email]);
if ($stmt->fetch()) json_out(['error'=>'Email sudah terdaftar.'], 409);
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO app_users (name, email, password_hash, role, is_active) VALUES (:name, :email, :hash, 'public', TRUE) RETURNING id, name, email, role");
$stmt->execute(['name'=>$name,'email'=>$email,'hash'=>$hash]);
$user = $stmt->fetch();
$_SESSION['user'] = $user;
json_out(['message'=>'Akun berhasil dibuat', 'user'=>$user], 201);
?>