<?php

namespace app\common\command;

use think\console\Command;

class BaseCommand extends Command {

    protected $logSave = 1;  // 1: 文件，2: 打印

    /**
     * 写入日志
     *
     * @param $type
     * @param $message
     */
    public function log($type, $message) {
        $data  = '[' . date('Y-m-d H:i:s') . ']' . PHP_EOL;
        $data .= '[' . $type . '] ' . $message . PHP_EOL . PHP_EOL;

        if ($this->logSave === 1) {
            $name  = get_class($this);
            $name  = substr($name, strrpos($name, '\\') + 1);
            $file  = ROOT_PATH . DS . 'runtime' . DS . $name . '_' . date('Ymd') . '.txt';

            file_put_contents($file, $data, FILE_APPEND);
        } else {
            echo $data;
        }
    }
}