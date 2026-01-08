<?php
// =====================================================
// videos.php – liefert die neuesten FunSaver-Videos als JSON
// =====================================================

header('Content-Type: application/json; charset=utf-8');

require __DIR__ . '/config.php';

try {
    // Neueste Videos zuerst
    $sql = "
        SELECT id, url, timestamp
        FROM records
        ORDER BY timestamp DESC
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $videos = [];

    foreach ($rows as $row) {
        // Egal was in der DB steht → wir nehmen nur den Dateinamen
        $filename = basename(trim($row['url']));

        // Finale, garantiert gültige URL
        $finalUrl = 'https://funsaver.ch/records/' . $filename;

        $videos[] = [
            'id'        => (int) $row['id'],
            'url'       => $finalUrl,
            'timestamp' => $row['timestamp'],
        ];
    }

    echo json_encode([
        'videos' => $videos
    ], JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'DB error',
        'message' => $e->getMessage()
    ]);
}
