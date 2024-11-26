<?php

require_once __DIR__.'/../private/db.php';

class DataWriter
{
    public function check($user) {
        $db = new CVdb();
        $result = $db->query("SELECT username FROM users WHERE username = '$user'");
        $ret = 404;
        if ($result->fetch_array()) {
            $ret = 200;
        }
        $db->close();
        return $ret;
    }


    public function create($username, $nome, $cognome, $societa, $password, $profilo) {
        $db = begin();
        try {
            $stmt = $db->prepare("INSERT INTO users(username, password, nome, cognome, profilo) VALUES (?, '" . password_hash($password, PASSWORD_DEFAULT) . "', ?, ?, ?)");
            $stmt->bind_param('ssss', $username, $nome, $cognome, $profilo);
            $result = $stmt->execute();
            $userid = $db->insert_id;
            $stmt = $db->prepare("INSERT INTO impiegati(userid, mansione, competenzePro, selezionato, dipendente, societa) VALUES (?, '', '', 1, 1, ?)");
            $stmt->bind_param('ii', $userid, $societa);
            $result = $result && $stmt->execute();
            if ($result) {
                commit($db);
            } else {
                $userid = -1;
                rollback($db);
            }
        } catch (Exception $e) {
            $userid = -1;
            rollback($db);
        }
        return $userid;
    }


    public function delete($id, $db) {
        $isolated = is_null($db);
        if ($isolated) {
            $db = new CVdb();
            $db->query('SET foreign_key_checks = 1');
        }
        try {
            $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $stmt->close();
        }
        catch(Exception $e) {
            if ($isolated) {
                $db->close();
            }
            return 500;
        }
        if ($isolated) {
            $db->close();
        }
        return 200;
    }


    public function edit($username, $nome, $cognome, $societa, $userid, $password, $profilo) {
        $db = new CVdb();
        try {
            $sql = 'UPDATE users SET username = ?, nome = ?, cognome = ?, profilo = ?';
            if ($password != '') {
                $sql .= ", password = '" . password_hash($password, PASSWORD_DEFAULT) . "', privacy = false";
            }
            $sql .= ' WHERE id = ?';
            $stmt = $db->prepare($sql);
            $stmt->bind_param('ssssi', $username, $nome, $cognome, $profilo, $userid);
            $result = $stmt->execute();        
            $stmt = $db->prepare('UPDATE impiegati SET societa = ? WHERE userid = ?');
            $stmt->bind_param('ii', $societa, $userid);
            $result = $result && $stmt->execute();
            if ($result) {
                commit($db);
            } else {
                rollback($db);
            }
        } catch (Exception $e) {
            rollback($db);
            $result = false;
        }
        return $result;
    }


    public function save($data, $cleanup) {
        $inf_data = $data['pInfo'];
        $exp_data = $data['exp'];
        $for_data = $data['form'];
        $lan_data = $data['lang'];
        $tag_data = $data['tags'];
        $res = FALSE;
        $userid = -1;
        if (isset($inf_data) && isset($exp_data) && isset($for_data) && isset($lan_data) && isset($tag_data)) {
            $db = begin();
            $res = TRUE;
            if ($cleanup) {
                $userid = $inf_data['id'];
                $res = ($this->deleteDatiImp($userid, $db) == 200);
            }
            if ($res) {
                $res = FALSE;
                $userid = $this->salvaPInfo($db, $inf_data, $userid);
                if ($userid != -1) {
                    if ($this->salvaExp($db, $exp_data, $userid) == 200) {
                        if ($this->salvaForm($db, $for_data, $userid) == 200) {
                            if ($this->salvaLang($db, $lan_data, $userid) == 200) {
                                $res = ($this->salvaTag($db, $tag_data, $userid) == 200);
                            }
                        }
                    }
                }
            }
            if ($res) {
                commit($db);
            } else {
                $userid = -1;
                rollback($db);
            }
        }
        return $userid;
    }


    private function deleteDatiImp($id, $db) {
        try {
            $tables = array('esperienze', 'formazione', 'lingue', 'tags');
            $index = 0;
            $result = true;
            while ($result && ($index < count($tables))) {
                $table = $tables[$index];
                $stmt = $db->prepare("DELETE FROM $table WHERE userid = ?");
                $stmt->bind_param('i', $id);
                $result = $stmt->execute();
                $index++;
            }
            $stmt->close();
        }
        catch (Exception $e) {
            return 500;
        }
        return 200;
    }

/*
    public function validate($id) {
        return (filter_var($id.'@linearsystem.it', FILTER_VALIDATE_EMAIL) != FALSE && preg_match("/\A([a-z]+([_]?[a-z]+)?[.][a-z]+([_]?[a-z]+)?)\z/", $id) == 1);
    }
*/

    private function salvaPInfo($db, $data, $userid) {
        try {
            if ($userid == -1) {
                // import
                $password = explode('.', $data['username'])[0];
                $stmt = $db->prepare("INSERT INTO users(username, password, nome, cognome, profilo) VALUES (?, '" . password_hash($password, PASSWORD_DEFAULT) . "', ?, ?, 'USER')");
                $stmt->bind_param('sss', $data['username'], $data['nome'], $data['cognome']);
                $stmt->execute();
                $userid = $db->insert_id;
                $stmt = $db->prepare("INSERT INTO impiegati(userid, mansione, competenzePro, foto, selezionato, dipendente, societa, ral, valutazione, giudizio, telefono, email_pers) SELECT ?, ?, ?, ?, ?, ?, id, ?, ?, ?, ?, ? FROM societa WHERE nome = ?");
                $stmt->bind_param('isssiiiissss', $userid, $data['mansione'], $data['competenzePro'], $data['foto'], $data['selezionato'], $data['dipendente'], $data['ral'], $data['valutazione'], $data['giudizio'], $data['telefono'], $data['email_pers'], $data['societa']);
                $stmt->execute();
            } else {
                // modifica
                $stmt = $db->prepare("UPDATE impiegati SET mansione = ?, competenzePro = ?, foto = ?, selezionato = ?, dipendente = ?, ral = ?, valutazione = ?, giudizio = ?, telefono = ?, email_pers = ? WHERE userid = ?");
                $stmt->bind_param('sssiiiisssi', $data['mansione'], $data['competenzePro'], $data['foto'], $data['selezionato'], $data['dipendente'], $data['ral'], $data['valutazione'], $data['giudizio'], $data['telefono'], $data['email_pers'], $userid);
                $stmt->execute();
            }
            
        }
        catch (Exception $e) {
            return -1;
        }
        return $userid;
    }


    private function salvaExp($db, $data, $userid) {
        try {
            for ($i = 0; $i < count($data); $i++) {
                $stmt = $db->prepare('INSERT INTO esperienze(userid, azienda, mansione, annoIn, annoFine, descrizione, selezionato) VALUES (?, ?, ?, ?, ?, ?, ?)');
                $stmt->bind_param('isssssi', $userid, $data[$i]['azienda'], $data[$i]['mansione'], $data[$i]['annoIn'], $data[$i]['annoFine'], $data[$i]['descrizione'], $data[$i]['selezionato']);
                $stmt->execute();
                $stmt->close();
            }
        }
        catch (Exception $e) {
            return 500;
        }
        return 200;
    }


    private function salvaForm($db, $data, $userid) {
        try {
            for ($i = 0; $i < count($data); $i++) {
                $stmt = $db->prepare('INSERT INTO formazione(userid, ente, certificazione, annoIn, annoFine, selezionato) VALUES (?, ?, ?, ?, ?, ?)');
                $stmt->bind_param('issssi', $userid, $data[$i]['ente'], $data[$i]['certificazione'], $data[$i]['annoIn'], $data[$i]['annoFine'], $data[$i]['selezionato']);
                $stmt->execute();
                $stmt->close();
            }
        }
        catch (Exception $e) {
            return 500;
        }
        return 200;
    }


    private function salvaLang($db, $data, $userid) {
        try {
            for ($i = 0; $i < count($data); $i++) {
                $stmt = $db->prepare('INSERT INTO lingue(userid, lingua, ascoltato, parlato, scritto, selezionato, ordine) SELECT ?, ?, ?, ?, ?, ?, COALESCE(MAX(ordine),0) + 1 FROM lingue WHERE userid = ?');
                $stmt->bind_param('issssii', $userid, $data[$i]['lingua'], $data[$i]['ascoltato'], $data[$i]['parlato'], $data[$i]['scritto'], $data[$i]['selezionato'], $userid);
                $stmt->execute();
                $stmt->close();
            }
        }
        catch (Exception $e) {
            return 500;
        }
        return 200;
    }


    private function salvaTag($db, $data, $userid) {
        try {
            for ($i = 0; $i < count($data); $i++) {
                $stmt = $db->prepare('INSERT INTO tags(userid, tag) VALUES (?, ?)');
                $stmt->bind_param('is', $userid, $data[$i]['tag']);
                $stmt->execute();
                $stmt->close();
            }
        }
        catch (Exception $e) {
            return 500;
        }
        return 200;
    }


    public function creaSocieta($data) {
        $db = new CVdb();
        $stmt = $db->prepare("INSERT INTO societa(nome, dominio, logo, carta_intestata) VALUES (?, ?, ?, ?)");
        $stmt->bind_param('ssss', $data['nome'], $data['dominio'], $data['logo'], $data['carta']);
        if ($stmt->execute()) {
            $result = $db->insert_id;
        } else {
            $result = 0;
        }
        $stmt->close();
        $db->close();
        return $result;
    }


    public function modificaSocieta($data) {
        $db = new CVdb();
        $stmt = $db->prepare("UPDATE societa SET nome = ?, dominio = ?, logo = ?, carta_intestata = ? WHERE id = ?");
        $stmt->bind_param('ssssi', $data['nome'], $data['dominio'], $data['logo'], $data['carta'], $data['id']);
        $result = $stmt->execute();
        $stmt->close();
        $db->close();
        return $result;
    }


    public function eliminaSocieta($id) {
        $db = new CVdb();
        $stmt = $db->prepare("DELETE FROM societa WHERE id = ?");
        $stmt->bind_param('i', $id);
        $result = $stmt->execute();
        $stmt->close();
        $db->close();
        return $result;
    }


    public function salvaPassword($user, $password) {
        $db = new CVdb();
        $stmt = $db->prepare("UPDATE users SET password = '" . password_hash($password, PASSWORD_DEFAULT) . "', privacy = true WHERE id = ?");
        $stmt->bind_param('i', $user);
        $result = $stmt->execute();
        $stmt->close();
        $db->close();
        return $result;
    }
}

?>