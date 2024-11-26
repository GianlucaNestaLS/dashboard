<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datareader.php';

$id = $_GET['id'];
$reader = new DataReader();

header('Content-Type: application/json');
echo json_encode($reader->getOne($id, true));
?>
