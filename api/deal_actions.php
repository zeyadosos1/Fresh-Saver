<?php

/**
 * POST /api/deal_actions.php
 *
 * Body (form-data):
 *   action     string  required  "add" | "edit" | "delete"
 *   vendor_id  int     required  The vendor performing the action
 *
 *   — For "add":
 *     item_name, category, original_price, discounted_price, expiry_date, stock
 *
 *   — For "edit":
 *     deal_id + same fields as add
 *
 *   — For "delete":
 *     deal_id
 *
 * Response 200:
 *   { success: true, data: { id: <new_or_updated_id> } }
 */

require_once __DIR__ . '/_bootstrap.php';

require_post();

$action    = post('action');
$vendor_id = (int) post('vendor_id');

if (empty($action) || $vendor_id <= 0) {
    json_error('action and vendor_id are required.');
}

// ── ADD ───────────────────────────────────────────────────────────────────────
if ($action === 'add') {
    $item_name        = post('item_name');
    $category         = post('category');
    $original_price   = (float) post('original_price');
    $discounted_price = (float) post('discounted_price');
    $expiry_date      = post('expiry_date');
    $stock            = (int) post('stock') ?: 1;

    if (empty($item_name) || empty($category) || empty($expiry_date)) {
        json_error('item_name, category, and expiry_date are required.');
    }
    if ($original_price <= 0 || $discounted_price <= 0) {
        json_error('Prices must be greater than zero.');
    }
    if ($discounted_price >= $original_price) {
        json_error('Discounted price must be less than original price.');
    }

    $stmt = $db->prepare(
        'INSERT INTO deals (vendor_id, item_name, category, original_price, discounted_price, expiry_date, stock)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('issddsi',
        $vendor_id, $item_name, $category,
        $original_price, $discounted_price,
        $expiry_date, $stock
    );
    $stmt->execute();
    $new_id = $db->insert_id;
    $stmt->close();

    json_ok(['id' => $new_id], 201);
}

// ── EDIT ──────────────────────────────────────────────────────────────────────
if ($action === 'edit') {
    $deal_id          = (int) post('deal_id');
    $item_name        = post('item_name');
    $category         = post('category');
    $original_price   = (float) post('original_price');
    $discounted_price = (float) post('discounted_price');
    $expiry_date      = post('expiry_date');
    $stock            = (int) post('stock');

    if ($deal_id <= 0) json_error('deal_id is required.');

    // Ownership check — vendor can only edit their own deals
    $check = $db->prepare('SELECT id FROM deals WHERE id = ? AND vendor_id = ? LIMIT 1');
    $check->bind_param('ii', $deal_id, $vendor_id);
    $check->execute();
    $check->store_result();
    if ($check->num_rows === 0) {
        $check->close();
        json_error('Deal not found or access denied.', 403);
    }
    $check->close();

    $stmt = $db->prepare(
        'UPDATE deals
         SET item_name=?, category=?, original_price=?, discounted_price=?, expiry_date=?, stock=?
         WHERE id=? AND vendor_id=?'
    );
    $stmt->bind_param('ssddsiii',
        $item_name, $category,
        $original_price, $discounted_price,
        $expiry_date, $stock,
        $deal_id, $vendor_id
    );
    $stmt->execute();
    $stmt->close();

    json_ok(['id' => $deal_id]);
}

// ── DELETE ────────────────────────────────────────────────────────────────────
if ($action === 'delete') {
    $deal_id = (int) post('deal_id');

    if ($deal_id <= 0) json_error('deal_id is required.');

    // Ownership check
    $check = $db->prepare('SELECT id FROM deals WHERE id = ? AND vendor_id = ? LIMIT 1');
    $check->bind_param('ii', $deal_id, $vendor_id);
    $check->execute();
    $check->store_result();
    if ($check->num_rows === 0) {
        $check->close();
        json_error('Deal not found or access denied.', 403);
    }
    $check->close();

    $stmt = $db->prepare('DELETE FROM deals WHERE id = ? AND vendor_id = ?');
    $stmt->bind_param('ii', $deal_id, $vendor_id);
    $stmt->execute();
    $stmt->close();

    json_ok(['id' => $deal_id]);
}

json_error("Unknown action: $action");
