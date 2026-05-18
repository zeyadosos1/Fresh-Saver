<?php

/**
 * POST /api/logout.php
 *
 * Destroys the PHP session (for users who also use the legacy PHP pages).
 *
 * Response 200:
 *   { success: true, data: { message: "Logged out." } }
 */

require_once __DIR__ . '/_bootstrap.php';

session_destroy();

json_ok(['message' => 'Logged out successfully.']);
