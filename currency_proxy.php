<?php
// Tillåt JS från vilken domän som helst
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Läs basvaluta och målvalutor från GET-parametrar
$base = isset($_GET['base']) ? strtoupper($_GET['base']) : 'USD';
$symbols = isset($_GET['symbols']) ? $_GET['symbols'] : ''; // tom = alla
$endpoint = 'latest';

// Skapa korrekt URL
$apiUrl = $symbols 
    ? "https://currencyrateapi.com/api/$endpoint?base=$base&symbols=$symbols"
    : "https://currencyrateapi.com/api/$endpoint?base=$base";

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

// Konvertera JSON till array
$data = json_decode($response, true);
if (!$data || !isset($data['rates'])) {
    echo json_encode([
        'error' => 'Inga kurser hittades i API-svaret'
    ]);
    exit;
}

// Filtrera bort valutor som inte finns (API returnerar bara de som finns)
$filteredRates = [];
foreach ($data['rates'] as $code => $rate) {
    if ($rate !== null && is_numeric($rate)) {
        $filteredRates[strtoupper($code)] = $rate; // Gör alltid stora bokstäver
    }
}

// Returnera filtrerade kurser
echo json_encode([
    'success' => true,
    'base' => strtoupper($data['base']),
    'date' => $data['date'] ?? null,
    'rates' => $filteredRates
]);
?>