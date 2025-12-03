<?php
// videos.php – liefert die neuesten Records als JSON

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/config.php';

// Neueste zuerst (timestamp DESC). Du kannst LIMIT 10 o.ä. setzen
$sql = "SELECT id, url, timestamp 
        FROM records 
        ORDER BY timestamp DESC";

$stmt   = $pdo->query($sql);
$rows   = $stmt->fetchAll();
$videos = [];

foreach ($rows as $row) {
    $url = trim($row['url']);

    // Beispiele aus deinem Screenshot: "funsaver.ch/records/demopic.png"
    // → wir machen daraus "https://funsaver.ch/records/demopic.png"
    if (strpos($url, 'http://') !== 0 && strpos($url, 'https://') !== 0) {
        // Wenn kein Protokoll drin ist
        if (strpos($url, 'funsaver.ch') === 0) {
            $url = 'https://' . $url;
        } elseif ($url[0] !== '/') {
            // falls nur "records/..." drinsteht
            $url = 'https://funsaver.ch/' . $url;
        } else {
            $url = 'https://funsaver.ch' . $url;
        }
    }

    $videos[] = [
        'id'        => (int) $row['id'],
        'url'       => $url,
        'timestamp' => $row['timestamp'],
    ];
}

echo json_encode(['videos' => $videos]);
