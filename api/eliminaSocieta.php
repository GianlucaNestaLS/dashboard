<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datawriter.php';

$id = $_POST['id'];

$writer = new DataWriter();

header('Content-Type: application/json');
if ($writer->eliminaSocieta($id)) {
    echo json_encode(array('success' => true));
} else {
    echo json_encode(array('success' => false));
}
?>
