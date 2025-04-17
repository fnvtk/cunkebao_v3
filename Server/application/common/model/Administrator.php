<?php

namespace app\common\model;

use think\Model;

/**
 * 超级管理员模型类
 */
class Administrator extends Model
{
    // 设置数据表名
    protected $name = 'administrators';

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';

    // 隐藏字段
    protected $hidden = [
        'password'
    ];
} 