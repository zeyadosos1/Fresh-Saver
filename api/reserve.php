<?php
require_once __DIR__ . '/_bootstrap.php';

require_post();

$user_id = post('user_id');
$items_json = post('items');

if (empty($user_id) || empty($items_json)) {
    json_error('User ID and items are required.');
}

$items = json_decode($items_json, true);

if (!is_array($items) || count($items) === 0) {
    json_error('Invalid items data.');
}

$db->begin_transaction();

try {
    foreach ($items as $item) {
        $deal_id = (int)$item['deal_id'];
        $qty = (int)$item['qty'];
        
        // Check stock
        $stmt = $db->prepare('SELECT stock FROM deals WHERE id = ? FOR UPDATE');
        $stmt->bind_param('i', $deal_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $deal = $result->fetch_assoc();
        
        if (!$deal || $deal['stock'] < $qty) {
            throw new Exception("Not enough stock for deal ID: $deal_id");
        }
        $stmt->close();
        
        // Update stock
        $update_stmt = $db->prepare('UPDATE deals SET stock = stock - ? WHERE id = ?');
        $update_stmt->bind_param('ii', $qty, $deal_id);
        $update_stmt->execute();
        $update_stmt->close();
        
        // Insert reservation valid for 1 day
        $res_stmt = $db->prepare('INSERT INTO reservations (user_id, deal_id, qty, valid_until) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))');
        $res_stmt->bind_param('iii', $user_id, $deal_id, $qty);
        $res_stmt->execute();
        $res_stmt->close();
    }
    
    $db->commit();
    json_ok(['message' => 'Reservations successful']);
} catch (Exception $e) {
    $db->rollback();
    json_error($e->getMessage());
}
