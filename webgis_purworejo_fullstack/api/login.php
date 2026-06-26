<?php
require_once __DIR__ . '/config.php';
$data = input_json();
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$stmt = $pdo->prepare('SELECT id, name, email, password_hash, role FROM app_users WHERE email = :email AND is_active = TRUE LIMIT 1');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();
if (!$user || !password_verify($password, $user['password_hash'])) {
    json_out(['error' => 'Email atau password salah.'], 401);
}
$_SESSION['user'] = ['id'=>$user['id'], 'name'=>$user['name'], 'email'=>$user['email'], 'role'=>$user['role']];
json_out(['message' => 'Login berhasil', 'user' => $_SESSION['user']]);
?>
