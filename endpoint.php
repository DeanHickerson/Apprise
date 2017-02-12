<?php

    // if we have an AJAX request...
    if (is_ajax()) {
        // ...and the data object we're expecting isn't empty...
        if (isset($_POST['data']) && !empty($_POST['data'])) {
            // then we'll store it locally in $data
            $data = $_POST['data'];

            // save it to a file, pretty self-explanatory
            save_to_files($data);

            // log this entry
            append_to_the_log($data);

            // and respond to the original AJAX request
            respond($data);
        }
    }

    // function to check if the request is an AJAX request
    function is_ajax() {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }

    // function to handle saving JSON data to file
    function save_to_files($data) {
        // do something with $data
        $fp = fopen('results.json', 'w');
        fwrite($fp, $data);
        fclose($fp);
    }

    function append_to_the_log($data) {
        $curLog = file_get_contents('log.json');
        $logPrep = substr($curLog, 0, -1);
        $logReady = $logPrep.','.$data.']';
        $fp = fopen('log.json', 'w');
        fwrite($fp, $logReady);
        fclose($fp);
    }

    function append_to_log($data) {
        // do something with $data
        // $fp = fopen('log.json', 'a');
        // fwrite($fp, $data);
        // fclose($fp);
        // read the file if present

        $filename = "log.json";

        $handle = @fopen($filename, 'r+');

        // create the file if needed
        if ($handle === null) {
            $handle = fopen($filename, 'w+');
        }

        if ($handle) {
            // seek to the end
            fseek($handle, 0, SEEK_END);

            // are we at the end of is the file empty
            if (ftell($handle) > 0) {
                // move back a byte
                fseek($handle, -1, SEEK_END);

                // add the trailing comma
                fwrite($handle, ',', 1);

                // add the new json string
                fwrite($handle, $data . ']');
            } else {
                // write the first event inside an array
                fwrite($handle, array($data));
            }

            // close the handle on the file
            fclose($handle);
        }
    }

    // function to handle responding to the original AJAX request
    function respond($data) {
        // build return object
        $obj = [
            'success' => true,
            'json' => json_decode($data)
        ];

        // prepare it for transport
        $jsonstring = json_encode($obj);

        // return it to the AJAX request
        echo $jsonstring;
    }



    /*
      FIX ALL OF THIS
    */

/*
    // TODO: log this request
    function update_log($data) {
      $fp = fopen('log.json', 'a');
      fwrite($fp, $data);
      fclose($fp);
    }

    // military payday checker
  	$milPay = NULL;
  	if (date('d') == 1 || date('d') == 2 || date('d') == 14 || date('d') == 15 || date('d') == 16 || date('d') == 31) {
  		$milPay = "<center><font color='#FF0000'>**Military Pay Day**</font> \r\n</center>";
  		$milPay = nl2br($milPay);
  	} else if (date('n') == 9) {
  		$milPay = "<center><font color='#FF0000'>**Membership Drive**</font> \r\n</center>";
  	}

    // output HTML
		$tickerPost = fopen("ticker1.htm", "w"); // when this variable is called - write the ticker file for UAD.
		fwrite($tickerPost, ('<html><head><title></title></head><body><font size="3">'.$milPay.$cleanMessage."\r\n"."</body></html>"));
		fclose($tickerPost); // close out and save the file.

		// output JSON
		$tickerJSON = fopen("ticker.json", "w"); // when this variable is called - write the ticker file for UAD.
		fwrite($tickerJSON, (json_encode($jsonObj)));
		fclose($tickerJSON); // close out and save the file.

    // send to log
		$tickerLog = fopen("tickerLog.txt", "a");
		fwrite($tickerLog, (date('m/d/y | H:i T')." | ".$user." | @IP: ".$ip." | ".$logMessage."\r\n"));
		fclose($tickerLog); // close out and save the file.
		copy("./tickerLog.txt","./tickerLogB.txt");
*/
?>
