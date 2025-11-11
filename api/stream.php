<?php
// api/stream.php
declare(strict_types=1);

// Sicherheits-Header
header('X-Content-Type-Options: nosniff');

$config = require __DIR__ . '/config.php';

$file = $_GET['file'] ?? '';
// nur einfache Dateinamen erlauben
if ($file === '' || !preg_match('/^[A-Za-z0-9._-]+$/', $file)) {
  http_response_code(400); echo 'Bad file name'; exit;
}

// Content-Type anhand der Extension
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$mimeMap = [
  'mp4'  => 'video/mp4',
  'm4v'  => 'video/mp4',
  'mov'  => 'video/quicktime',
  'webm' => 'video/webm',
];
$contentType = $mimeMap[$ext] ?? 'application/octet-stream';

// FTP verbinden
function ftp_connect_login(array $cfg) {
  if (!function_exists('ftp_connect')) { http_response_code(500); exit('FTP extension missing'); }
  if (!empty($cfg['use_ftps']) && function_exists('ftp_ssl_connect')) {
    $conn = @ftp_ssl_connect($cfg['host'], $cfg['port'] ?? 21, 10);
  } else {
    $conn = @ftp_connect($cfg['host'], $cfg['port'] ?? 21, 10);
  }
  if (!$conn) { http_response_code(502); exit('FTP connect failed'); }
  if (!@ftp_login($conn, $cfg['username'], $cfg['password'])) { http_response_code(401); exit('FTP auth failed'); }
  @ftp_pasv($conn, true);
  return $conn;
}

$conn = ftp_connect_login($config);

// In Zielordner wechseln
$path = $config['path'] ?? '/';
if ($path !== '/' && !@ftp_chdir($conn, $path)) {
  ftp_close($conn); http_response_code(404); exit('FTP path not found');
}

// Dateigröße (optional)
$size = @ftp_size($conn, $file);
if ($size > 0) {
  header("Content-Length: $size");
}
header("Content-Type: $contentType");
// Hinweis: Wir implementieren hier **keine** HTTP-Range-Requests.
// Scrubbing/Spulen kann eingeschränkt sein. Für volle Spulfähigkeit wäre ein
// zwischengeschalteter Cache/Proxy oder Synchronisation empfehlenswert.

$dest = fopen('php://output', 'wb');
if ($dest === false) { ftp_close($conn); http_response_code(500); exit('Stream open failed'); }

// Direkt vom FTP in die Ausgabe streamen
$ok = @ftp_fget($conn, $dest, $file, FTP_BINARY, 0);
fclose($dest);
ftp_close($conn);

if (!$ok) { http_response_code(404); exit('File not found or read error'); }
