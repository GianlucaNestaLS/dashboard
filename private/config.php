<?php

class Config
{
    const DBHOST = 'localhost';
    const DBUSER = 'fw4d4lxo_cv';
    const DBPASS = 'Yi*jWisJ9H16';
    const DBNAME = 'fw4d4lxo_cv';

    public static function dbhost() {
        return self::DBHOST;
    }

    public static function dbuser() {
        return self::DBUSER;
    }

    public static function dbpass() {
        return self::DBPASS;
    }

    public static function dbname() {
        return self::DBNAME;
    }

    public static function AllowCrossOrigin() {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: content-type, content-disposition, session-user, session-token');
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            exit;
        }
    }

    const PROFILE_PICS_PATH = 'profile-pics';

    public static function ProfilePicsPath() {
        return self::PROFILE_PICS_PATH;
    }

    const SESSION_EXP = 3600 * 2;

    public static function SessionExp() {
        return self::SESSION_EXP;
    }
}

?>
