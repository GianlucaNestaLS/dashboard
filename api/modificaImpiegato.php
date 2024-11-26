<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datawriter.php';

$nome    = htmlspecialchars($_POST['nome']);
$cognome = htmlspecialchars($_POST['cognome']);
$username = $_POST['username'];
$societa = $_POST['societa'];
$userid = $_POST['userid'];
$password = $_POST['password'];
$profilo = $_POST['profilo'];

$exec = FALSE;
$writer = new DataWriter();

header('Content-Type: application/json');

if ($writer->edit($username, $nome, $cognome, $societa, $userid, $password, $profilo)) {
    echo json_encode(array('success' => true));
} else {
    echo json_encode(array('success' => false, 'errorMsg' => 'Username già presente nel database.'));
}

?>
