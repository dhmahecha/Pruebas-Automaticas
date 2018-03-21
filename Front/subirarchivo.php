<?php


$i=$_POST["herramienta"];

$ruta="";

switch ($i) {
    case 1:
        $ruta="cypress/integration/";
        break;
    case 2:
        $ruta="reportes/nightwatch/";
        break;
    case 3:
        $ruta="reportes/lighthouse/";
        break;
}



$digits = 3;
$sufijo= rand(pow(10, $digits-1), pow(10, $digits)-1);
$sufijo="";


    if ( 0 < $_FILES['file']['error'] ) {
        echo 'Error: ' . $_FILES['file']['error'] . '<br>';
    }
    else {
        move_uploaded_file($_FILES['file']['tmp_name'], $ruta . $sufijo . $_FILES['file']['name']);
		echo 'perfecto';
    }

?>