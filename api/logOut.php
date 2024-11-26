<?php

require_once __DIR__.'/../lib/accesscontrol.php';

$ac = new AccessControl();
$ac->logout($_POST["userid"], $_POST["token"]);

header("Content-Type: application/json");
echo json_encode(array('logout' => 'ok'));
?>
