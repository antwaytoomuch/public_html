<?php
    header('Content-Type: application/json;charset=utf-8');

    $merchantIdentifier = "merchant.com.example.warsawtest";
    $domainName = "https://www.wsground.com/wsupload";
    $displayName = "WSGround";

    $data = [ 'merchantIdentifier' => "$merchantIdentifier", 'domainName' => "$domainName", 'displayName' => "$displayName" ];

    // echo $data;
    echo json_encode($data);
 ?>
