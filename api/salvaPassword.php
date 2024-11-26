<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datawriter.php';

$user = $_SERVER['HTTP_SESSION_USER'];
$password = htmlspecialchars($_POST['pwd']);

$writer = new DataWriter();

header('Content-Type: application/json');
if ($writer->salvaPassword($user, $password)) {
    echo json_encode(array('success' => true));
} else {
    echo json_encode(array('success' => false));
}
?>
