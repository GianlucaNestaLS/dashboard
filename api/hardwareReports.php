<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datareader.php';

// Recupera i parametri dalla richiesta
$societa = $_GET['societa'] ?? '';
$dipendente = $_GET['dipendente'] ?? '';
$colonna = $_GET['colonna'] ?? 'all'; // Colonna di default: tutte

$reader = new DataReader();

try {
    // Elenco delle colonne valide
    $colonneValide = [
        'all',
        'nome_dispositivo',
        'marca_modello_notebook',
        'serial_number',
        'product_key',
        'mac_address',
        'processore',
        'memoria_ram',
        'tipo_storage',
        'capacita_storage',
        'monitor_esterno',
        'tastiera_mouse_esterni',
        'stampante',
        'data_compilazione'
    ];

    // Valida la colonna scelta per evitare SQL Injection
    if (!in_array($colonna, $colonneValide)) {
        throw new Exception("Colonna non valida: $colonna");
    }

    // Costruzione della lista colonne
    $columns = ['nome', 'cognome']; // Nome e cognome sono sempre presenti

    if ($colonna !== 'all') {
        $columns[] = $colonna; // Aggiunge la colonna selezionata
    } else {
        $columns = array_merge($columns, array_diff($colonneValide, ['all'])); // Tutte le colonne meno 'all'
    }

    // Passa le colonne come stringa separata da virgole al metodo hardwareReports
    header('Content-Type: application/json');
    echo json_encode($reader->hardwareReports($societa, $dipendente, $columns));
} catch (Exception $e) {
    // Gestione degli errori
    http_response_code(400); // Errore 400: Bad Request
    echo json_encode(['error' => $e->getMessage()]);
}

