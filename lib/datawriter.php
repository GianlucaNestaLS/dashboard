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
        // Verifica delle chiavi richieste e aggiunta di log
        error_log("DEBUG: Avvio della funzione save");
    
        $inf_data = $data['pInfo'] ?? null;
        $exp_data = $data['exp'] ?? null;
        $for_data = $data['form'] ?? null;
        $lan_data = $data['lang'] ?? null;
        $tag_data = $data['tags'] ?? null;
        $hw_data = $data['hardware'] ?? null;
        $sw_data = $data['software'] ?? null;
    
        if (!$inf_data) error_log("AVVISO: Mancano dati in 'pInfo'");
        if (!$exp_data) error_log("AVVISO: Mancano dati in 'exp'");
        if (!$for_data) error_log("AVVISO: Mancano dati in 'form'");
        if (!$lan_data) error_log("AVVISO: Mancano dati in 'lang'");
        if (!$tag_data) error_log("AVVISO: Mancano dati in 'tags'");
        if (!$hw_data) error_log("AVVISO: Mancano dati in 'hardware'");
        if (!$sw_data) error_log("AVVISO: Mancano dati in 'software'");
    
        $res = FALSE;
        $userid = -1;
    
        if ($inf_data && $exp_data && $for_data && $lan_data && $tag_data && $hw_data && $sw_data) {
            $db = begin();
            error_log("DEBUG: Connessione al database avviata");
            $res = TRUE;
    
            if ($cleanup) {
                $userid = $inf_data['id'];
                error_log("DEBUG: Cleanup richiesto per userid: $userid");
                $res = ($this->deleteDatiImp($userid, $db) == 200);
            }
    
            if ($res) {
                $res = FALSE;
                $userid = $this->salvaPInfo($db, $inf_data, $userid);
                error_log("DEBUG: salvaPInfo risultato userid: $userid");
    
                if ($userid != -1) {
                    if ($this->salvaExp($db, $exp_data, $userid) == 200) {
                        error_log("DEBUG: salvaExp completato");
                        if ($this->salvaForm($db, $for_data, $userid) == 200) {
                            error_log("DEBUG: salvaForm completato");
                            if ($this->salvaLang($db, $lan_data, $userid) == 200) {
                                error_log("DEBUG: salvaLang completato");
    
                                // Salvataggio hardware e software separati
                                if ($this->salvaHardware($db, $hw_data, $userid) == 200) {
                                    error_log("DEBUG: salvaHardware completato");
                                    if ($this->salvaSoftware($db, $sw_data, $userid) == 200) {
                                        error_log("DEBUG: salvaSoftware completato");
    
                                        $res = ($this->salvaTag($db, $tag_data, $userid) == 200);
                                        if ($res) {
                                            error_log("DEBUG: salvaTag completato");
                                        } else {
                                            error_log("ERRORE: salvaTag fallito");
                                        }
                                    } else {
                                        error_log("ERRORE: salvaSoftware fallito");
                                    }
                                } else {
                                    error_log("ERRORE: salvaHardware fallito");
                                }
                            } else {
                                error_log("ERRORE: salvaLang fallito");
                            }
                        } else {
                            error_log("ERRORE: salvaForm fallito");
                        }
                    } else {
                        error_log("ERRORE: salvaExp fallito");
                    }
                } else {
                    error_log("ERRORE: salvaPInfo ha restituito userid -1");
                }
            }
    
            if ($res) {
                commit($db);
                error_log("DEBUG: Transazione completata con successo");
            } else {
                $userid = -1;
                rollback($db);
                error_log("ERRORE: Transazione annullata");
            }
        } else {
            error_log("ERRORE: Dati mancanti per la funzione save");
        }
    
        return $userid;
    }

    // public function save($data, $cleanup) {
    //     // Log di avvio della funzione
    //     error_log("DEBUG: Avvio della funzione save");
    
    //     $inf_data = $data['pInfo'] ?? null;
    //     $exp_data = $data['exp'] ?? null;
    //     $for_data = $data['form'] ?? null;
    //     $lan_data = $data['lang'] ?? null;
    //     $tag_data = $data['tags'] ?? null;
    //     $hw_data = $data['hardware'] ?? null;
    //     $sw_data = $data['software'] ?? null;
    
    //     if (!$inf_data) error_log("AVVISO: Mancano dati in 'pInfo'");
    //     if (!$exp_data) error_log("AVVISO: Mancano dati in 'exp'");
    //     if (!$for_data) error_log("AVVISO: Mancano dati in 'form'");
    //     if (!$lan_data) error_log("AVVISO: Mancano dati in 'lang'");
    //     if (!$tag_data) error_log("AVVISO: Mancano dati in 'tags'");
    //     if (!$hw_data) error_log("AVVISO: Mancano dati in 'hardware'");
    //     if (!$sw_data) error_log("AVVISO: Mancano dati in 'software'");
    
    //     $res = false;
    //     $userid = -1;
    
    //     if ($inf_data && $exp_data && $for_data && $lan_data && $tag_data && $hw_data && $sw_data) {
    //         $db = begin();
    //         error_log("DEBUG: Connessione al database avviata");
    //         $res = true;
    
    //         error_log("DEBUG: Cleanup richiesto. Valore di \$cleanup: " . var_export($cleanup, true));
    //         if ($cleanup) {
    //             $userid = $inf_data['id'];
    //             error_log("DEBUG: Cleanup richiesto per userid: $userid");
    //             $res = ($this->deleteDatiImp($userid, $db) == 200);
    //         }
            
    //         if ($res) {
    //             $userid = $this->salvaPInfo($db, $inf_data, $userid);
    //             if ($userid != -1) {
    //                 if ($this->salvaExp($db, $exp_data, $userid) == 200 &&
    //                     $this->salvaForm($db, $for_data, $userid) == 200 &&
    //                     $this->salvaLang($db, $lan_data, $userid) == 200 &&
    //                     $this->salvaHardware($db, $hw_data, $userid) == 200 &&
    //                     $this->salvaSoftware($db, $sw_data, $userid) == 200 &&
    //                     $this->salvaTag($db, $tag_data, $userid) == 200) {
    //                     commit($db);
    //                     error_log("DEBUG: Transazione completata con successo");
    //                     $res = true;
    //                 } else {

    //                     rollback($db);
    //                     error_log("ERRORE: Errore durante il salvataggio di una delle tabelle.");
    //                     $res = false;
    //                 }
    //             } else {
    //                 error_log("ERRORE: salvaPInfo ha restituito userid -1");
    //                 $res = false;
    //             }
    //         } else {
    //             error_log("ERRORE: Cleanup fallito.");
    //         }
    
    //         if (!$res) {
    //             rollback($db);
    //             error_log("DEBUG: Rollback eseguito.");
    //         }
    //     } else {
    //         error_log("ERRORE: Dati mancanti per la funzione save.");
    //     }
    
    //     return $userid;
    // }
    
    
    private function deleteDatiImp($id, $db) {
        try {
            $tables = array('esperienze', 'formazione', 'lingue', 'tags', 'hardware', 'software');
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

    // private function deleteDatiImp($id, $db) {
    //     try {
    //         $tables = ['esperienze', 'formazione', 'lingue', 'tags', 'hardware', 'software'];
    //         foreach ($tables as $table) {
    //             // Preparazione della query in modo sicuro, senza concatenazioni dirette
    //             $stmt = $db->prepare("DELETE FROM $table WHERE userid = ?");
    //             if (!$stmt) {
    //                 error_log("Errore nella preparazione della query DELETE per la tabella $table: " . $db->error);
    //                 return 500; // Fallimento nella preparazione della query
    //             }
    //             $stmt->bind_param('i', $id);
    
    //             if (!$stmt->execute()) {
    //                 error_log("Errore durante l'esecuzione della query DELETE per la tabella $table: " . $stmt->error);
    //                 $stmt->close();
    //                 return 500; // Fallimento nell'esecuzione della query
    //             }
    //             $stmt->close(); // Chiudi la query per ogni iterazione
    //         }
    //     } catch (Exception $e) {
    //         error_log("Eccezione catturata in deleteDatiImp: " . $e->getMessage());
    //         return 500; // Ritorna errore in caso di eccezione
    //     }
    //     return 200; // Successo
    // }
    

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

    private function salvaHardware($db, $data, $userid) {
        try {
            error_log("Inizio salvaHardware per userid: $userid");
    
            // Verifica se esiste un record nella tabella hardware per l'utente utilizzando userid
            $stmt = $db->prepare("SELECT userid FROM hardware WHERE userid = ?");
            if (!$stmt) {
                throw new Exception("Preparazione della query SELECT hardware fallita: " . $db->error);
            }
            $stmt->bind_param('i', $userid);
            $stmt->execute();
            $stmt->store_result();
    
            if ($stmt->num_rows > 0) {
                error_log("Record hardware esistente trovato, procedo con l'aggiornamento per userid: $userid.");
                $stmt->close();
                // Query di aggiornamento
                $stmt = $db->prepare("
                    UPDATE hardware
                    SET data_compilazione = ?, 
                        marca_modello_notebook = ?, 
                        serial_number = ?, 
                        product_key = ?, 
                        processore = ?, 
                        memoria_ram = ?, 
                        tipo_storage = ?, 
                        capacita_storage = ?, 
                        monitor_esterno = ?, 
                        tastiera_mouse_esterni = ?, 
                        stampante = ?
                    WHERE userid = ?
                ");
            } else {
                error_log("Nessun record hardware trovato, procedo con l'inserimento per userid: $userid.");
                $stmt->close();
                // Query di inserimento
                $stmt = $db->prepare("
                    INSERT INTO hardware (
                        userid, 
                        data_compilazione, 
                        marca_modello_notebook, 
                        serial_number, 
                        product_key, 
                        processore, 
                        memoria_ram, 
                        tipo_storage, 
                        capacita_storage, 
                        monitor_esterno, 
                        tastiera_mouse_esterni, 
                        stampante
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
            }
    
            if (!$stmt) {
                throw new Exception("Preparazione della query hardware fallita: " . $db->error);
            }
    
            // Assegna i valori a variabili locali
            $dataCompilazione = $data['data_compilazione'] ?? date('Y-m-d');
            $marcaModelloNotebook = $data['marca_modello_notebook'] ?? 'Sconosciuto';
            $serialNumber = $data['serial_number'] ?? 'N/D';
            $productKey = $data['product_key'] ?? 'N/D';
            $processore = $data['processore'] ?? 'N/D';
            $memoriaRAM = $data['memoria_ram'] ?? '0 GB';
            $tipoStorage = $data['tipo_storage'] ?? 'N/D';
            $capacitaStorage = $data['capacita_storage'] ?? '0 GB';
            $monitorEsterno = isset($data['monitor_esterno']) ? $data['monitor_esterno'] : 0;
            $tastieraMouseEsterni = isset($data['tastiera_mouse_esterni']) ? $data['tastiera_mouse_esterni'] : 0;
            $stampante = isset($data['stampante']) ? $data['stampante'] : 0;
    

            error_log("Valori da salvare: data_compilazione=$dataCompilazione, marca_modello_notebook=$marcaModelloNotebook, serial_number=$serialNumber, product_key=$productKey, processore=$processore, memoria_ram=$memoriaRAM, tipo_storage=$tipoStorage, capacita_storage=$capacitaStorage, monitor_esterno=$monitorEsterno, tastiera_mouse_esterni=$tastieraMouseEsterni, stampante=$stampante");
            // Associa i parametri alla query usando variabili
            $stmt->bind_param(
                'issssssssiii',
                $userid,
                $dataCompilazione,
                $marcaModelloNotebook,
                $serialNumber,
                $productKey,
                $processore,
                $memoriaRAM,
                $tipoStorage,
                $capacitaStorage,
                $monitorEsterno,
                $tastieraMouseEsterni,
                $stampante,
            );
    
            if (!$stmt->execute()) {
                throw new Exception("Errore durante l'esecuzione della query hardware: " . $stmt->error);
            }
    
            error_log("Query hardware eseguita con successo per userid: $userid.");
            $stmt->close();
            return 200; // Successo
        } catch (Exception $e) {
            error_log("Errore in salvaHardware per userid: $userid. Messaggio: " . $e->getMessage());
            return 500; // Fallimento
        }
    }
    
    private function salvaSoftware($db, $data, $userid) {
        try {
            // Log iniziale
            error_log("Inizio salvaSoftware per userid: $userid");
    
            // Variabili locali per i valori da bindare
            $sistema_operativo = $data['sistema_operativo'] ?? null;
            $office_suite = $data['office_suite'] ?? null;
            $browser = $data['browser'] ?? null;
            $antivirus = $data['antivirus'] ?? null;
            $software_comunicazione = $data['software_comunicazione'] ?? null;
            $software_crittografia = $data['software_crittografia'] ?? null;
    
            // Query di inserimento o aggiornamento
            $stmt = $db->prepare("
                INSERT INTO software (
                    userid, 
                    sistema_operativo, 
                    office_suite, 
                    browser, 
                    antivirus, 
                    software_comunicazione, 
                    software_crittografia
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    sistema_operativo = VALUES(sistema_operativo),
                    office_suite = VALUES(office_suite),
                    browser = VALUES(browser),
                    antivirus = VALUES(antivirus),
                    software_comunicazione = VALUES(software_comunicazione),
                    software_crittografia = VALUES(software_crittografia)
            ");
    
            if (!$stmt) {
                throw new Exception("Preparazione della query software fallita: " . $db->error);
            }
    
            // Associa i parametri alla query usando variabili
            $stmt->bind_param(
                'issssss',
                $userid,
                $sistema_operativo,
                $office_suite,
                $browser,
                $antivirus,
                $software_comunicazione,
                $software_crittografia
            );
    
            // Esecuzione della query
            if (!$stmt->execute()) {
                error_log("Errore durante l'esecuzione della query salvaSoftware per userid: $userid. Errore: " . $stmt->error);
                $stmt->close();
                return 500;
            }
    
            error_log("Query eseguita con successo per userid: $userid.");
            $stmt->close();
            return 200; // Successo
        } catch (Exception $e) {
            error_log("Errore in salvaSoftware per userid: $userid. Messaggio: " . $e->getMessage());
            return 500; // Fallimento
        }
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