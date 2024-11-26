<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datareader.php';

$societa = isset($_GET['societa']) ? $_GET['societa'] : '';
$reader = new DataReader();
$impiegati = $reader->getList($societa);

header("Content-Type: application/json");
echo json_encode($impiegati);
?>
