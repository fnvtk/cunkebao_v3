<?php

namespace app\common\command;

use think\console\Input;
use think\console\Output;

class TestCommand extends BaseCommand {

    protected $logSave = 2;

    protected function configure() {
        $this->setName('Test')
            ->setDescription('command test.');
    }

    protected function execute(Input $input, Output $output) {
        print_r('hello test.');
    }
}