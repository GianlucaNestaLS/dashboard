<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datareader.php';

$ids = $_POST["ids"];
$id = explode(";", $ids);

$infoImpiegati = [];

$reader = new DataReader();
foreach ($id as &$value) {
    //$infoImpiegati[$value] = $reader->getOne($value, false);
    $data = $reader->getOne($value, false);
    $infoImpiegati[$data['pInfo']['username']] = $data;
}

header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="Impiegati.json"');

echo json_encode($infoImpiegati, JSON_PRETTY_PRINT);
?>
