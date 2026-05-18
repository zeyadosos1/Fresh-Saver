<?php

/**
 * GET /api/deals.php
 *
 * Query parameters (all optional):
 *   category   string   Filter by category (Produce, Bakery, Dairy, Meat, Other)
 *   vendor_id  int      Return only deals for this vendor (for dashboard)
 *   search     string   Search by item_name
 *
 * Response 200:
 *   { success: true, data: [ ...deals ] }
 *
 * Each deal object:
 *   { id, vendor_id, vendor_name, item_name, category,
 *     original_price, discounted_price, expiry_date, stock, created_at }
 */

require_once __DIR__ . '/_bootstrap.php';

require_get();

$category  = get_param('category');
$vendor_id = (int) get_param('vendor_id');
$search    = get_param('search');

// ── Build query dynamically ───────────────────────────────────────────────────
$sql    = 'SELECT d.id, d.vendor_id, u.name AS vendor_name,
                  d.item_name, d.category,
                  d.original_price, d.discounted_price,
                  d.expiry_date, d.stock, d.created_at
           FROM deals d
           JOIN users u ON d.vendor_id = u.id
           WHERE 1=1';

$params = [];
$types  = '';

// Vendor-specific (dashboard): include all, even expired
if ($vendor_id > 0) {
    $sql    .= ' AND d.vendor_id = ?';
    $params[] = $vendor_id;
    $types   .= 'i';
} else {
    // Public browse: only active & in-stock
    $sql .= ' AND d.expiry_date >= CURDATE() AND d.stock > 0';
}

if (!empty($category) && $category !== 'All') {
    $sql    .= ' AND d.category = ?';
    $params[] = $category;
    $types   .= 's';
}

if (!empty($search)) {
    $sql    .= ' AND d.item_name LIKE ?';
    $params[] = '%' . $search . '%';
    $types   .= 's';
}

$sql .= ' ORDER BY d.expiry_date ASC';

// ── Execute ───────────────────────────────────────────────────────────────────
$stmt = $db->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$deals  = [];

while ($row = $result->fetch_assoc()) {
    // Cast numeric fields for correct JSON types
    $row['id']               = (int)   $row['id'];
    $row['vendor_id']        = (int)   $row['vendor_id'];
    $row['original_price']   = (float) $row['original_price'];
    $row['discounted_price'] = (float) $row['discounted_price'];
    $row['stock']            = (int)   $row['stock'];
    $deals[] = $row;
}

$stmt->close();

json_ok($deals);
