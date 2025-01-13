<?php

require_once __DIR__.'/../private/db.php';

class Tag
{
    public $name;
    public $percent;
    public $count;

    public function __construct($n, $p, $c) {
        $this->name = $n;
        $this->percent = $p;
        $this->count = $c;
    }
}

class Stats
{
    public $name;
    public $percent;
    public $count;

    public function __construct($name, $percent, $count) {
        $this->name = $name;
        $this->percent = $percent;
        $this->count = $count;
    }
}

class DataReader
{
    public function getList($societa) {
        $data = [];
        $db = new CVdb();
        $query = "SELECT i.userid, u.username, u.nome, cognome, s.nome societa, s.dominio, s.id id_soc, u.profilo, i.dipendente, i.telefono, i.email_pers,
                  CASE WHEN EXISTS (SELECT 1 FROM esperienze WHERE userid = i.userid UNION SELECT 1 FROM formazione WHERE userid = i.userid UNION SELECT 1 FROM lingue WHERE userid = i.userid) THEN 'SI' ELSE 'NO' END cv_compilato
                  FROM impiegati i JOIN societa s ON s.id = i.societa JOIN users u ON u.id = i.userid ";
        if ($societa != '') {
            $query .= "WHERE i.societa = $societa ";
        }
        $query .= 'ORDER BY cognome, nome';
        $result = $db->query($query);
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            array_push($data, $row);
        }
        $db->close();
        return $data;
    }


    public function getOne($id, $full) {
        $data = [];
        $db = new CVdb();
        $data["pInfo"] = self::getPInfo($db, $id);
        $data["exp"] = self::getExp($db, $id);
        $data["form"] = self::getForm($db, $id);
        $data["lang"] = self::getLang($db, $id);
        $data["hardware"] = self::getHardware($db, $id);
        $data["software"] = self::getSoftware($db, $id);
        $data["tags"] = self::getTags($db, $id);
        if ($full) {
            $data["listLvl"] = self::getListaLivelli($db);
            $data["listLang"] = self::getListaLingue($db);
        }
        $db->close();
        return $data;
    }


    public function getTagList($societa) {
        $data = [];
        $db = new CVdb();
        $query = 'SELECT DISTINCT tag FROM tags ';
        if ($societa != '') {
            $query .= "WHERE userid IN (SELECT userid FROM impiegati WHERE societa = $societa)";
        }
        $query .= 'ORDER BY tag';
        $result = $db->query($query);
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            array_push($data, $row['tag']);
        }
        $db->close();
        return $data;
    }


    public function searchTags($tags, $societa) {
        $sql = "SELECT t.userid, t.tag, u.nome, u.cognome, u.username, s.nome societa, i.dipendente, i.telefono, i.email_pers
                FROM tags t JOIN users u ON u.id = t.userid JOIN impiegati i ON i.userid = u.id JOIN societa s ON s.id = i.societa
                WHERE ";
        $count = count($tags);
        for ($i = 0; $i < $count; $i++) {
            if ($i > 0) {
                $sql .= ' OR ';
            } else {
                $sql .= '(';
            }
            $sql .= 'UPPER(t.tag) = ?';
            if ($i == $count - 1) {
                $sql .= ')';
            }
        }
        if ($societa != '') {
            $sql .= " AND i.societa = $societa";
        }
        $sql .= " ORDER BY t.tag, u.cognome, u.nome";
        $db = new CVdb();
        $stmt = $db->prepare($sql);
        $tags = array_map('strtoupper', $tags);
        $params = array_merge(array(str_repeat('s', $count)), array_values($tags));
        $params_ref = array();
        foreach ($params as $key => $value) {
            $params_ref[$key] = &$params[$key];
        }
        call_user_func_array(array(&$stmt, 'bind_param'), $params_ref);
        $index = array();
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            $id = $row['userid'];
            if (isset($index[$id])) {
                $index[$id]['tag'] .= ', ' . $row['tag'];
            } else {
                $index[$id] = $row;
            }
        }
        $stmt->close();
        $db->close();
        $data = array();
        foreach ($index as $id => $info) {
            array_push($data, $info);
        }
        return $data;
    }


    public function tagStats($societa, $dipendente) {
        $dataset = array();
        $db = new CVdb();
        $condition = '';
        $params = [];
        $where = 'WHERE userid IN (SELECT userid FROM impiegati WHERE';
    
        if ($societa != '') {
            $condition = "$where societa = ?";
            $params[] = $societa;
        }
    
        if ($dipendente != '') {
            $prefix = $condition == '' ? $where : ' AND';
            $condition .= "$prefix dipendente = ?";
            $params[] = $dipendente;
        }
    
        if ($condition != '') {
            $condition .= ')';
        }
    
        // Query principale per conteggio totale
        $stmt = $db->prepare("SELECT COUNT(tag), COUNT(DISTINCT userid) FROM tags $condition");
        if (!empty($params)) {
            $stmt->bind_param(str_repeat('s', count($params)), ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_array(MYSQLI_NUM);
        $tags = $row[0];
        $imp = $row[1];
        $stmt->close();
    
        if ($tags > 0) {
            // Query per conteggio dei tag
            $stmt = $db->prepare("SELECT tag, COUNT(tag) AS c 
                                   FROM tags $condition 
                                   GROUP BY tag 
                                   HAVING c > 1 
                                   ORDER BY 2 DESC, 1 ASC");
            if (!empty($params)) {
                $stmt->bind_param(str_repeat('s', count($params)), ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_array(MYSQLI_NUM)) {
                array_push($dataset, new Tag($row[0], ($row[1] / $tags) * 100, $row[1]));
            }
            $stmt->close();
    
            // Calcolo degli "altri"
            if (empty($dataset)) {
                $sql = "SELECT tag, COUNT(tag) AS c 
                        FROM tags $condition 
                        GROUP BY tag";
            } else {
                $sql = "SELECT SUM(c) 
                        FROM (
                            SELECT tag, COUNT(tag) AS c 
                            FROM tags $condition 
                            GROUP BY tag 
                            HAVING c = 1
                        ) t";
            }
    
            $stmt = $db->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param(str_repeat('s', count($params)), ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
    
            if (empty($dataset)) {
                while ($row = $result->fetch_array(MYSQLI_NUM)) {
                    array_push($dataset, new Tag($row[0], ($row[1] / $tags) * 100, $row[1]));
                }
            } else {
                $others = intval($result->fetch_array(MYSQLI_NUM)[0]);
                array_push($dataset, new Tag('Altri', ($others / $tags) * 100, $others));
            }
            $stmt->close();
        }
    
        $db->close();
        return array('data' => $dataset, 'imp' => $imp);
    }
    

    public function softwareStats($societa, $dipendente, $colonna) {
        // Convalida il parametro colonna
        $colonnaValida = in_array($colonna, [
            'sistema_operativo',
            'office_suite',
            'browser',
            'antivirus',
            'software_comunicazione',
            'software_crittografia'
        ]) ? $colonna : 'sistema_operativo';
    
        $dataset = [];
        $db = new CVdb();
        $condition = '';
        $params = [];
        $where = 'WHERE userid IN (SELECT userid FROM impiegati WHERE';
    
        if ($societa != '') {
            $condition = "$where societa = ?";
            $params[] = $societa;
        }
    
        if ($dipendente != '') {
            $prefix = $condition == '' ? $where : ' AND';
            $condition .= "$prefix dipendente = ?";
            $params[] = $dipendente;
        }
    
        if ($condition != '') {
            $condition .= ')';
        }
    
        // Query principale per il conteggio
        $stmt = $db->prepare("SELECT COUNT($colonnaValida), COUNT(DISTINCT userid) FROM software $condition");
        if (!empty($params)) {
            $stmt->bind_param(str_repeat('s', count($params)), ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_array(MYSQLI_NUM);
        $software = $row[0];
        $imp = $row[1];
        $stmt->close();
    
        if ($software > 0) {
            // Query per il conteggio per la colonna specificata
            $stmt = $db->prepare("SELECT $colonnaValida, COUNT($colonnaValida) AS c 
                                   FROM software $condition 
                                   GROUP BY $colonnaValida 
                                   HAVING c > 1 
                                   ORDER BY 2 DESC, 1 ASC");
            if (!empty($params)) {
                $stmt->bind_param(str_repeat('s', count($params)), ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_array(MYSQLI_NUM)) {
                array_push($dataset, new Stats($row[0], ($row[1] / $software) * 100, $row[1]));
            }
            $stmt->close();
    
            // Calcolo degli "altri"
            if (empty($dataset)) {
                $sql = "SELECT $colonnaValida, COUNT($colonnaValida) AS c 
                        FROM software $condition 
                        GROUP BY $colonnaValida";
            } else {
                $sql = "SELECT SUM(c) FROM (
                            SELECT $colonnaValida, COUNT($colonnaValida) AS c 
                            FROM software $condition 
                            GROUP BY $colonnaValida 
                            HAVING c = 1
                        ) t";
            }
            $stmt = $db->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param(str_repeat('s', count($params)), ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            if (empty($dataset)) {
                while ($row = $result->fetch_array(MYSQLI_NUM)) {
                    array_push($dataset, new Stats($row[0], ($row[1] / $software) * 100, $row[1]));
                }
            } else {
                $others = intval($result->fetch_array(MYSQLI_NUM)[0]);
                array_push($dataset, new Stats('Altro', ($others / $software) * 100, $others));
            }
            $stmt->close();
        }
    
        $db->close();
    
        return [
            'data' => $dataset,
            'imp' => $imp
        ];
    }
    

    public function hardwareStats($societa, $dipendente, $colonna) {
        // Convalida il parametro colonna
        $colonnaValida = in_array($colonna, [
            'marca_modello_notebook',
            'processore',
            'memoria_ram',
            'tipo_storage',
            'capacita_storage',
            'monitor_esterno',
            'tastiera_mouse_esterni',
            'stampante',
        ]) ? $colonna : 'marca_modello_notebook';
    
        $dataset = [];
        $db = new CVdb();
        $condition = '';
        $params = [];
        $where = 'WHERE userid IN (SELECT userid FROM impiegati WHERE';
    
        if ($societa != '') {
            $condition = "$where societa = ?";
            $params[] = $societa;
        }
    
        if ($dipendente != '') {
            $prefix = $condition == '' ? $where : ' AND';
            $condition .= "$prefix dipendente = ?";
            $params[] = $dipendente;
        }
    
        if ($condition != '') {
            $condition .= ')';
        }
    
        // Query principale per il conteggio
        $stmt = $db->prepare("SELECT COUNT($colonnaValida), COUNT(DISTINCT userid) FROM hardware $condition");
        if (!empty($params)) {
            $stmt->bind_param(str_repeat('s', count($params)), ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_array(MYSQLI_NUM);
        $hardware = $row[0];
        $imp = $row[1];
        $stmt->close();
    
        if ($hardware > 0) {
            // Query per il conteggio per la colonna specificata
            $stmt = $db->prepare("SELECT $colonnaValida, COUNT($colonnaValida) AS c 
                                   FROM hardware $condition 
                                   GROUP BY $colonnaValida 
                                   HAVING c > 1 
                                   ORDER BY 2 DESC, 1 ASC");
            if (!empty($params)) {
                $stmt->bind_param(str_repeat('s', count($params)), ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_array(MYSQLI_NUM)) {
                array_push($dataset, new Stats($row[0], ($row[1] / $hardware) * 100, $row[1]));
            }
            $stmt->close();
    
            // Calcolo degli "altri"
            if (empty($dataset)) {
                $sql = "SELECT $colonnaValida, COUNT($colonnaValida) AS c 
                        FROM hardware $condition 
                        GROUP BY $colonnaValida";
            } else {
                $sql = "SELECT SUM(c) FROM (
                            SELECT $colonnaValida, COUNT($colonnaValida) AS c 
                            FROM hardware $condition 
                            GROUP BY $colonnaValida 
                            HAVING c = 1
                        ) t";
            }
            $stmt = $db->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param(str_repeat('s', count($params)), ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            if (empty($dataset)) {
                while ($row = $result->fetch_array(MYSQLI_NUM)) {
                    array_push($dataset, new Stats($row[0], ($row[1] / $hardware) * 100, $row[1]));
                }
            } else {
                $others = intval($result->fetch_array(MYSQLI_NUM)[0]);
                array_push($dataset, new Stats('Altro', ($others / $hardware) * 100, $others));
            }
            $stmt->close();
        }
    
        $db->close();
    
        return [
            'data' => $dataset,
            'imp' => $imp
        ];
    }

    
    public function hardwareReports($societa, $dipendente, $colonna) {
        // Convalida il parametro colonna
        $colonnaValida = in_array($colonna, [
            'marca_modello_notebook',
            'processore',
            'memoria_ram',
            'tipo_storage',
            'capacita_storage',
            'monitor_esterno',
            'tastiera_mouse_esterni',
            'stampante',
        ]) ? $colonna : 'marca_modello_notebook';
    
        $dataset = [];
        $db = new CVdb();
        $condition = '';
        $params = [];
        $where = 'WHERE userid IN (SELECT userid FROM impiegati WHERE';
    
        if ($societa != '') {
            $condition = "$where societa = ?";
            $params[] = $societa;
        }
    
        if ($dipendente != '') {
            $prefix = $condition == '' ? $where : ' AND';
            $condition .= "$prefix dipendente = ?";
            $params[] = $dipendente;
        }
    
        if ($condition != '') {
            $condition .= ')';
        }
    
        // Query principale per i dettagli dell'hardware, con nome e cognome sempre visibili
        $stmt = $db->prepare("SELECT 
                                    u.nome,
                                    u.cognome,
                                    h.nome_dispositivo,
                                    h.marca_modello_notebook,
                                    h.serial_number,
                                    h.product_key,
                                    h.mac_address,
                                    h.processore,
                                    h.memoria_ram,
                                    h.tipo_storage,
                                    h.capacita_storage,
                                    h.monitor_esterno,
                                    h.tastiera_mouse_esterni,
                                    h.stampante,
                                    h.data_compilazione
                                FROM hardware h
                                JOIN users u ON h.userid = u.id
                                $condition");
    
        if (!empty($params)) {
            $stmt->bind_param(str_repeat('s', count($params)), ...$params);
        }
    
        $stmt->execute();
        $result = $stmt->get_result();
    
        while ($row = $result->fetch_assoc()) {
            $dataset[] = [
                'nome' => $row['nome'],
                'cognome' => $row['cognome'],
                'nome_dispositivo' => $row['nome_dispositivo'],
                'marca_modello_notebook' => $row['marca_modello_notebook'],
                'serial_number' => $row['serial_number'],
                'product_key' => $row['product_key'],
                'mac_address' => $row['mac_address'],
                'processore' => $row['processore'],
                'memoria_ram' => $row['memoria_ram'],
                'tipo_storage' => $row['tipo_storage'],
                'capacita_storage' => $row['capacita_storage'],
                'monitor_esterno' => $row['monitor_esterno'],
                'tastiera_mouse_esterni' => $row['tastiera_mouse_esterni'],
                'stampante' => $row['stampante'],
                'data_compilazione' => $row['data_compilazione']
            ];
        }
    
        $stmt->close();
        $db->close();
    
        return [
            'data' => $dataset
        ];
    }

    private function getPInfo($db, $id) {
        $stmt = $db->prepare("SELECT u.id, u.username, u.nome, cognome, mansione, competenzePro, foto, selezionato, dipendente, s.nome societa, s.id id_soc, s.dominio, s.logo, s.carta_intestata, ral, valutazione, giudizio, telefono, email_pers FROM impiegati i JOIN societa s ON s.id = i.societa JOIN users u ON u.id = i.userid WHERE u.id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_array(MYSQLI_ASSOC);
        $stmt->close();
        return $data;
    }


    private function getExp($db, $id) {
        $data = [];
        $stmt = $db->prepare("SELECT mansione, azienda, annoFine, annoIn, descrizione, selezionato FROM esperienze WHERE userid = ? ORDER BY CASE WHEN annoFine IS NULL THEN 9999 END DESC, annoIn DESC");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            $data[] = $row;
        }
        $stmt->close();
        return $data;
    }


    private function getForm($db, $id) {
        $data = [];
        $stmt = $db->prepare("SELECT certificazione, annoFine, annoIn, ente, selezionato FROM formazione WHERE userid = ? ORDER BY annoFine DESC, annoIn DESC");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            $data[] = $row;
        }
        $stmt->close();
        return $data;
    }


    private function getLang($db, $id) {
        $data = [];
        $stmt = $db->prepare("SELECT lingua, ascoltato, parlato, scritto, selezionato FROM lingue WHERE userid = ? ORDER BY ordine");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            $data[] = $row;
        }
        $stmt->close();
        return $data;
    }

    private static function getHardware($db, $userid) {
        $hardwareData = [];
        $query = "SELECT 
                    data_compilazione,
                    marca_modello_notebook,
                    serial_number,
                    product_key,
                    nome_dispositivo,
                    mac_address,
                    processore,
                    memoria_ram,
                    tipo_storage,
                    capacita_storage,
                    monitor_esterno,
                    tastiera_mouse_esterni,
                    stampante
                  FROM hardware
                  WHERE userid = ?";
    
        $stmt = $db->prepare($query);
        $stmt->bind_param('i', $userid);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $hardwareData = $result->fetch_assoc();
        }
    
        $stmt->close();
        return $hardwareData;
    }
    
    private static function getSoftware($db, $userid) {
        $softwareData = [];
        $query = "SELECT 
                    data_compilazione,
                    sistema_operativo,
                    office_suite,
                    browser,
                    antivirus,
                    software_comunicazione,
                    software_crittografia
                  FROM software
                  WHERE userid = ?";
    
        $stmt = $db->prepare($query);
        $stmt->bind_param('i', $userid);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows > 0) {
            $softwareData = $result->fetch_assoc();
        }
    
        $stmt->close();
        return $softwareData;
    }


    private function getTags($db, $id) {
        $data = [];
        $result = $db->query("SELECT tag FROM tags WHERE userid = $id ORDER BY @rownum");
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            $data[] = $row;
        }
        return $data;
    }



    private function getListaLingue($db) {
        $data = [];
        $result = $db->query('SELECT lingua AS L FROM listaLingue ORDER BY lingua');
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            $data[] = $row["L"];
        }
        return $data;
    }


    private function getListaLivelli($db) {
        $data = [];
        $result = $db->query('SELECT livello AS L FROM listaLivelli ORDER BY livello');
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            $data[] = $row["L"];
        }
        return $data;
    }


    public function getSocieta() {
        $data = [];
        $db = new CVdb();
        $result = $db->query('SELECT * FROM societa ORDER BY nome');
        while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
            array_push($data, $row);
        }
        $db->close();
        return $data;
    }
}

?>