<?php

require_once __DIR__.'/../lib/accesscontrol.php';

Config::AllowCrossOrigin();

$user = '';
$token = '';

$headers = [];
foreach ($_SERVER as $name => $value)
{
    if ($name == 'HTTP_SESSION_USER') {
        $user = $value;
    }
    if ($name == 'HTTP_SESSION_TOKEN') {
        $token = $value;
    }
}

if ($user == '' && $token == '') {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        if (isset($_POST['session-user']) && isset($_POST['session-token'])) {
            $user = $_POST['session-user'];
            $token = $_POST['session-token'];
        }
    } else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        if (isset($_GET['session-user']) && isset($_GET['session-token'])) {
            $user = $_GET['session-user'];
            $token = $_GET['session-token'];
        }
    }
}

$ac = new AccessControl();
$remainder = $ac->sessionCheck($user, $token);
if ($remainder < 0) {
    header("Content-Type: application/json");
    echo json_encode(array('forbidden' => true, 'user' => $user, 'token' => $token, 'remainder' => $remainder));
    exit;
} else {
    $ac->updateSession($user, $token, time() + Config::SessionExp());
}
?>
