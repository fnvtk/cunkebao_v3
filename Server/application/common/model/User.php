<?php

namespace app\common\model;

use think\Model;
use think\model\concern\SoftDelete;

class User extends Model
{
    use SoftDelete;

    /**
     * 数据表名
     * @var string
     */
    protected $name = 'users';

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    protected $deleteTime = 'deleteTime';
    protected $defaultSoftDelete = 0;

    /**
     * 隐藏属性
     * @var array
     */
    protected $hidden = ['passwordMd5', 'passwordLocal', 'deleteTime'];
} 