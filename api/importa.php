<?php

require_once __DIR__.'/../private/check.php';
require_once __DIR__.'/../lib/datawriter.php';

$file = file_get_contents('php://input');
$json_a = json_decode($file, true);

$skipped = 0;
$written = 0;
$failed = 0;
$details = array();
$writer = new DataWriter();
foreach ($json_a as $user => $data) {
    $res = $writer->check($user);
    if ($res == 404) {
        $id = $writer->save($data, FALSE);
        if ($id != -1) {
            $details[$user] = "written $id";
            $written++;
        } else {
            $details[$user] = 'failed';
            $failed++;
        }
    } else {
        $details[$user] = 'skipped';
        $skipped++;
    }
}

header('Content-Type: application/json');
echo json_encode(array('written' => $written, 'skipped' => $skipped, 'failed' => $failed, 'details' => $details));

?>
