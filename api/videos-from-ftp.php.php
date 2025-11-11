<?php
// api/videos-from-ftp.php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$config = require __DIR__ . '/config.php';

function ftp_connect_login(array $cfg) {
  if (!function_exists('ftp_connect')) {
    http_response_code(500);
    echo json_encode(['error' => 'PHP FTP extension not available']);
    exit;
  }
  if (!empty($cfg['use_ftps']) && function_exists('ftp_ssl_connect')) {
    $conn = @ftp_ssl_connect($cfg['host'], $cfg['port'] ?? 21, 10);
  } else {
    $conn = @ftp_connect($cfg['host'], $cfg['port'] ?? 21, 10);
  }
  if (!$conn) { http_response_code(502); echo json_encode(['error'=>'FTP connect failed']); exit; }
  if (!@ftp_login($conn, $cfg['username'], $cfg['password'])) {
    http_response_code(401); echo json_encode(['error'=>'FTP auth failed']); ftp_close($conn); exit;
  }
  @ftp_pasv($conn, true); // PASV an
  return $conn;
}

function extract_num(string $name): int {
  return preg_match('/(\d+)/', $name, $m) ? (int)$m[1] : 0;
}

$conn = ftp_connect_login($config);

// In Zielordner wechseln
$path = $config['path'] ?? '/';
if ($path !== '/' && !@ftp_chdir($conn, $path)) {
  http_response_code(404); echo json_encode(['error'=>'FTP path not found']); ftp_close($conn); exit;
}

// Dateien holen
$list = @ftp_nlist($conn, '.');
if ($list === false) $list = [];

$allowed = array_map('strtolower', $config['exts'] ?? []);
$files = [];
foreach ($list as $item) {
  // nlist kann "." und ".." enthalten
  if ($item === '.' || $item === '..') continue;
  $ext = strtolower(pathinfo($item, PATHINFO_EXTENSION));
  if (!in_array($ext, $allowed, true)) continue;

  // Größe/mtime (optional)
  $size  = @ftp_size($conn, $item);
  $mtime = @ftp_mdtm($conn, $item);
  $files[] = [
    'name'  => $item,
    // Proxy-URL zu stream.php (wir streamen über HTTP)
    'url'   => '/api/stream.php?file=' . rawurlencode($item),
    'num'   => extract_num($item),
    'size'  => $size,
    'mtime' => $mtime,
  ];
}

// Sortieren: höchste Nummer zuerst
usort($files, fn($a,$b) => ($b['num'] <=> $a['num']) ?: (($b['mtime'] ?? 0) <=> ($a['mtime'] ?? 0)));

ftp_close($conn);
echo json_encode($files, JSON_UNESCAPED_SLASHES);
