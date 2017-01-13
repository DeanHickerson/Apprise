<?php
    // output JSON
    $tempData = $_POST['jsonData'];
    //$json = json_decode(stripslashes($_POST['jsonData']), true);
    //$tempData = html_entity_decode($tempData);
    //$cleanData = json_decode($tempData);
	$file = fopen("alert.json", "w"); // when this variable is called - write the ticker file.
	fwrite($file, $tempData);
	fclose($file); // close out and save the file.

    /*
    $raw = $_POST['json'];
    $htmlData = html_entity_decode($raw);
    $cleanData = json_decode($htmlData, true);
    if ($cleanData != null) {
        $file = fopen('alert.json','w');
        echo fwrite($file, $cleanData);
        fclose($file);
    } else {
        // user has posted invalid JSON, handle the error
        $file = fopen('alert.json','w');
        fwrite($file, json_last_error().json_last_error_msg());
        fclose($file);
    }
    */
?>
