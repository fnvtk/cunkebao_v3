<?php
namespace app\common\model;

use think\Model;

/**
 * 项目模型
 */
class Company extends Model
{
    // 设置数据表名
    protected $name = 'company';

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
} 