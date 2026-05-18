<?php

/**
 * POST /api/register.php
 *
 * Body (form-data):
 *   name     string  required
 *   email    string  required
 *   password string  required
 *   role     string  "shopper" | "vendor"  (default: shopper)
 *
 * Response 201:
 *   { success: true, data: { message: "Account created." } }
 * Response 409:
 *   { success: false, message: "Email already registered." }
 */

require_once __DIR__ . '/_bootstrap.php';

require_post();

$name     = post('name');
$email    = post('email');
$password = post('password');
$role     = post('role') ?: 'shopper';

// Basic validation
if (empty($name) || empty($email) || empty($password)) {
    json_error('Name, email, and password are required.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('Invalid email address.');
}

if (strlen($password) < 6) {
    json_error('Password must be at least 6 characters.');
}

if (!in_array($role, ['shopper', 'vendor'], true)) {
    $role = 'shopper';
}

// Check for duplicate email
$stmt = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $stmt->close();
    json_error('That email is already registered.', 409);
}
$stmt->close();

// Insert new user
$hashed = password_hash($password, PASSWORD_DEFAULT);
$stmt   = $db->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $name, $email, $hashed, $role);
$stmt->execute();
$stmt->close();

json_ok(['message' => 'Account created successfully. Please log in.'], 201);
