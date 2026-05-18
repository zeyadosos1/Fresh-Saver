<?php

/**
 * API Bootstrap — api/_bootstrap.php
 * Every API endpoint includes this file first.
 * Sets JSON headers, CORS, and provides the DB connection + helpers.
 */

// ── CORS (allow Angular dev server at :4200) ─────────────────────────────────
$allowedOrigins = [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// ── JSON content type ────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');

// ── Session ──────────────────────────────────────────────────────────────────
session_start();

// ── Database ─────────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config.php';   // defines $host, $user, $password, $database
$db = new mysqli($host, $user, $password, $database);
if ($db->connect_error) {
    json_error('Database connection failed: ' . $db->connect_error, 500);
}
$db->set_charset('utf8mb4');

// ── Helper functions ─────────────────────────────────────────────────────────

/** Send a JSON success response and exit. */
function json_ok(mixed $data = [], int $status = 200): void {
    http_response_code($status);
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit();
}

/** Send a JSON error response and exit. */
function json_error(string $message, int $status = 400): void {
    http_response_code($status);
    echo json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

/** Require a POST request. */
function require_post(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST required', 405);
}

/** Require a GET request. */
function require_get(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('GET required', 405);
}

/** Get a required POST field or abort. */
function post(string $key, string $default = ''): string {
    return trim($_POST[$key] ?? $default);
}

/** Get a required GET param or abort. */
function get_param(string $key, string $default = ''): string {
    return trim($_GET[$key] ?? $default);
}
