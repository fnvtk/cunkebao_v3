<?php

namespace app\common\model;

use think\Model;

/**
 * 流量池模型类
 */
class TrafficSource extends Model
{
    // 设置数据表名
    protected $name = 'traffic_source';

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
} 