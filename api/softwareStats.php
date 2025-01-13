<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datareader.php';

// Recupera i parametri dalla richiesta
$societa = $_GET['societa'] ?? '';
$dipendente = $_GET['dipendente'] ?? '';
$colonna = $_GET['colonna'] ?? 'sistema_operativo'; // Colonna di default: 'sistema_operativo'

$reader = new DataReader();

try {
    // Valida la colonna scelta per evitare SQL Injection
    $colonneValide = ['sistema_operativo', 'office_suite', 'browser', 'antivirus', 'software_comunicazione', 'software_crittografia'];
    if (!in_array($colonna, $colonneValide)) {
        throw new Exception("Colonna non valida: $colonna");
    }

    // Richiama il metodo passando i parametri
    header('Content-Type: application/json');
    echo json_encode($reader->softwareStats($societa, $dipendente, $colonna));
} catch (Exception $e) {
    // Gestione degli errori
    http_response_code(400); // Errore 400: Bad Request
    echo json_encode(['error' => $e->getMessage()]);
}
?>
