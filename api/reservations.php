<?php
require_once __DIR__ . '/_bootstrap.php';

$user_id = $_GET['user_id'] ?? null;

if (empty($user_id)) {
    json_error('User ID is required.');
}

$stmt = $db->prepare('
    SELECT r.id, r.qty, r.valid_until, r.created_at, d.item_name, d.discounted_price, u.name as vendor_name 
    FROM reservations r
    JOIN deals d ON r.deal_id = d.id
    JOIN users u ON d.vendor_id = u.id
    WHERE r.user_id = ? AND r.valid_until > NOW()
    ORDER BY r.created_at DESC
');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();

$reservations = [];
while ($row = $result->fetch_assoc()) {
    $reservations[] = $row;
}

$stmt->close();

json_ok(['reservations' => $reservations]);
