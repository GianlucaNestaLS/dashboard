<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datareader.php';

$reader = new DataReader();
$societa = $reader->getSocieta();

header("Content-Type: application/json");
echo json_encode($societa);
?>
