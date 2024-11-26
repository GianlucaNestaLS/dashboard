<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datareader.php';

$societa = isset($_GET['societa']) ? $_GET['societa'] : '';
$reader = new DataReader();
$tags = $reader->getTagList($societa);

header("Content-Type: application/json");
echo json_encode($tags);

?>
