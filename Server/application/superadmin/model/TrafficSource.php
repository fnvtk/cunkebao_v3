<?php
namespace app\superadmin\model;

use think\Model;

/**
 * 流量来源模型
 */
class TrafficSource extends Model
{
    // 设置数据表名
    protected $name = 'traffic_source';
    
    // 设置表前缀
    protected $prefix = 'ck_';
    
    // 设置主键
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'identifier' => 'string',
        'companyId' => 'integer',
        'createTime' => 'datetime',
        'updateTime' => 'integer'
    ];
    
    // 定义字段验证规则
    protected $rule = [
        'identifier' => 'require|max:64',
        'companyId' => 'number',
        'fromd' => 'max:255'
    ];
    
    // 定义字段验证提示信息
    protected $message = [
        'identifier.require' => '标识符不能为空',
        'identifier.max' => '标识符最多不能超过64个字符',
        'companyId.number' => '公司ID必须为数字',
        'fromd.max' => '来源最多不能超过255个字符'
    ];
} 