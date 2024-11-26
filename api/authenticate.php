<?php

require_once __DIR__.'/../lib/accesscontrol.php';

Config::AllowCrossOrigin();

$username = $_POST['username'];
$ac = new AccessControl();
$response = $ac->authenticate($username, $_POST['password']);
if ($response['authenticate']) {
    $time = time() + Config::SessionExp();
    $token = uniqid();
    $ac->sessionStart($username, $time, $token);
    $response['session-token'] = $token;
}

header('Content-Type: application/json');
echo json_encode($response);

?>
