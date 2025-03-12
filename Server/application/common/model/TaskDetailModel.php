<?php

namespace app\common\model;

use think\Model;

class TaskDetailModel extends Model {

    const STATUS_AWAIT = 0;
    const STATUS_RUNNING = 10;
    const STATUS_SUCC = 20;
    const STATUS_FAIL = 99;

    protected $json = ['params', 'info'];
    protected $jsonAssoc = TRUE;
}