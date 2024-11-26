<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datawriter.php';

$id = $_POST["id"];

$writer = new DataWriter();
$result = $writer->delete($id, NULL);

header("Content-Type: application/json");
if ($result == 500) {
    echo json_encode(array('success' => false));
} else {
    echo json_encode(array('success' => true));
}
?>
