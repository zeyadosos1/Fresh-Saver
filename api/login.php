<?php

/**
 * POST /api/login.php
 *
 * Body (form-data or x-www-form-urlencoded):
 *   email    string  required
 *   password string  required
 *
 * Response 200:
 *   { success: true, data: { user: { id, name, email, role } } }
 * Response 401:
 *   { success: false, message: "..." }
 */

require_once __DIR__ . '/_bootstrap.php';

require_post();

$email    = post('email');
$password = post('password');

if (empty($email) || empty($password)) {
    json_error('Email and password are required.');
}

// Look up user
$stmt = $db->prepare('SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();
$stmt->close();

if (!$user || !password_verify($password, $user['password'])) {
    json_error('Incorrect email or password.', 401);
}

// Store session (keeps legacy PHP pages working too)
$_SESSION['user_id'] = $user['id'];
$_SESSION['name']    = $user['name'];
$_SESSION['email']   = $user['email'];
$_SESSION['role']    = $user['role'];

// Never return the hashed password to the client
unset($user['password']);

json_ok(['user' => $user]);
