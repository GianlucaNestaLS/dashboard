<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datareader.php';

$societa = $_GET['societa'];
$dipendente = $_GET['dipendente'];
$reader = new DataReader();

header('Content-Type: application/json');
echo json_encode($reader->stats($societa, $dipendente));
?>
