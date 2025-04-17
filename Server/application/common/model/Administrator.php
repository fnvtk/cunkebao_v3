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

    // 隐藏字段
    protected $hidden = [
        'password'
    ];
} 