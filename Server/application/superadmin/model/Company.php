<?php
namespace app\superadmin\model;

use think\Model;

/**
 * 公司（项目）模型
 */
class Company extends Model
{
    // 设置数据表名
    protected $name = 'company';
    
    // 设置主键
    protected $pk = 'id';
    
    // 设置时间格式为datetime类型
    protected $autoWriteTimestamp = 'datetime';
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = 'lastUpdateTime';
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'tenantId' => 'integer',
        'isTop' => 'integer',
        'level' => 'integer',
        'parentId' => 'integer',
        'privileges' => 'json',
        'createTime' => 'datetime',
        'lastUpdateTime' => 'datetime'
    ];
} 