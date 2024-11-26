<?php

require_once 'config.php';

class CVdb extends mysqli
{
	public function __construct() {
        @parent::__construct(Config::dbhost(), Config::dbuser(), Config::dbpass(), Config::dbname());
        if ($this->connect_errno) {
            throw new exception($this->connect_error, $this->connect_errno);
        }
        $this->set_charset('utf8');
	}
}


function begin() {
    $db = new CVdb();
    $db->query('SET foreign_key_checks = 1');
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $db->begin_transaction();
    return $db;
}


function beginNoFK() {
    $db = new CVdb();
    $db->query('SET foreign_key_checks = 0');
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $db->begin_transaction();
    return $db;
}


function commit($db) {
    $db->commit();
    return $db;
}


function rollback($db) {
    $db->rollback();
    return $db;
}

?>