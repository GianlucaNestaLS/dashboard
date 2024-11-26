<?php

require_once __DIR__.'/../private/check.php';

$target_file = __DIR__ . '/../' . Config::ProfilePicsPath() . '/' . basename($_FILES["file"]["name"]);

if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    echo json_encode(array('success' => true));
} else {
	switch ($_FILES['file']['error']) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $msg = 'Superata la massima dimensione consentita per il file.';
			break;
        case UPLOAD_ERR_NO_FILE:
            $msg = 'Nessun file specificato.';
			break;
        default:
            $msg = 'Errore sconosciuto.';
			break;
    }
    echo json_encode(array('success' => false, 'msg' => $msg));
}

?>