<?php
// Tillåt JS från vilken domän som helst
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Läs basvaluta och målvalutor från GET-parametrar
$base = isset($_GET['base']) ? $_GET['base'] : 'USD';
$symbols = isset($_GET['symbols']) ? $_GET['symbols'] : 'GBP,JPY,EUR';
$endpoint = 'latest';

// Skapa korrekt URL
$apiUrl = "https://currencyrateapi.com/api/$endpoint?base=$base&symbols=$symbols";

// Initiera cURL
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError || $httpcode !== 200) {
    echo json_encode([
        'error' => 'Fel vid fetch av kurser',
        'curl_error' => $curlError,
        'http_code' => $httpcode
    ]);
    exit;
}

// Returnera rådata från API
echo $response;
?>