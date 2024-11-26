<?php

require_once __DIR__.'/../private/db.php';

class AccessControl
{
    public function authenticate($username, $password) {
        $auth = array('authenticate' => false);
        $db = new CVdb();
        $result = $db->query("SELECT id, password, CONCAT(nome, ' ', cognome) utente, profilo, privacy, societa FROM users u LEFT JOIN impiegati i ON i.userid = u.id WHERE username = '$username'");
        if ($row = $result->fetch_array(MYSQLI_NUM)) {
            $auth = array('authenticate' => password_verify($password, $row[1]), 'id' => $row[0], 'utente' => $row[2], 'profilo' => $row[3], 'privacy' => $row[4], 'societa' => $row[5]);
        }
        $db->close();
        return $auth;
    }


    public function sessionStart($username, $time, $token) {
        $db = new CVdb();
        $stmt = $db->prepare("UPDATE users SET session_ex = ?, session_id = ? WHERE username = ?");
        $stmt->bind_param('iss', $time, $token, $username);
        $stmt->execute();
        $stmt->close();
        $db->close();
    }


    public function sessionCheck($userid, $token) {
        $remainder = -1;
        $db = new CVdb();
        $result = $db->query("SELECT session_ex FROM users WHERE id = $userid AND session_id = '$token'");
        if ($row = $result->fetch_array(MYSQLI_NUM)) {
            $remainder = $row[0] - time();
        }
        $db->close();
        return $remainder;
    }


    public function updateSession($userid, $token, $time) {
        $db = new CVdb();
        $stmt = $db->prepare("UPDATE users SET session_ex = ? WHERE id = ? AND session_id = ?");
        $stmt->bind_param('iis', $time, $userid, $token);
        $stmt->execute();
        $stmt->close();
        $db->close();
    }

    
    public function logout($userid, $token) {
        $db = new CVdb();
        $stmt = $db->prepare("UPDATE users SET session_id = '', session_ex = 0 WHERE id = ? AND session_id = ?");
        $stmt->bind_param('is', $userid, $token);
        $stmt->execute();
        $stmt->close();
        $db->close();
    }
}
?>
