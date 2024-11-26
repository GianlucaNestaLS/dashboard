<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datareader.php';

$search = htmlspecialchars(strtolower($_POST['expertise']));
$tags   = explode(',', $search);
$societa = isset($_GET['societa']) ? $_GET['societa'] : '';

$reader = new DataReader();
$data = $reader->searchTags($tags, $societa);

header('Content-Type: application/json');
echo json_encode($data);
?>
