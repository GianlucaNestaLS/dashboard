<?php

require_once __DIR__.'/../private/check.php';

$directory = __DIR__ . '/../' . Config::ProfilePicsPath();

$pics = array_diff(scandir($directory), array('..', '.'));
$data = array();
foreach ($pics as $pic) {
	$tokens = explode('.', $pic);
	$count = count($tokens);

	/*if ($count > 1 && strtolower($tokens[$count -1]) == 'jpg') {
		$data[] = implode('.', array_splice($tokens, 0, $count - 1));
	} else {*/
		$data[] = $pic;
	//}
}

header("Content-Type: application/json");
echo json_encode($data);
?>
