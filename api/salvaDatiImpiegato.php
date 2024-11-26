<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datawriter.php';

$data = file_get_contents('php://input');
$data = json_decode($data, true);

$writer = new DataWriter();

header("Content-Type: application/json");

if ($writer->save($data, TRUE) != -1) {
    echo json_encode(array('success' => true));
} else {
    echo json_encode(array('success' => false, 'errorMsg' => 'Qualcosa è andato storto.'));
}

?>
