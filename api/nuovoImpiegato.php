<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datawriter.php';

$nome = htmlspecialchars($_POST['nome']);
$cognome = htmlspecialchars($_POST['cognome']);
$username = $_POST['username'];
$societa = $_POST['societa'];
$password = $_POST['password'];
$profilo = $_POST['profilo'];

$writer = new DataWriter();

header('Content-Type: application/json');

$userid = $writer->create($username, $nome, $cognome, $societa, $password, $profilo);
if ($userid != -1) {
    echo json_encode(array('success' => true, 'userid' => $userid));
} else {
    echo json_encode(array('success' => false, 'errorMsg' => 'Qualcosa è andato storto.'));
}

?>
