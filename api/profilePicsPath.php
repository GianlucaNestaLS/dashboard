<?php

require_once __DIR__.'/../private/check.php';

$path = './'.Config::ProfilePicsPath();
header("Content-Type: application/json");
echo json_encode(array("path" => $path));
?>
