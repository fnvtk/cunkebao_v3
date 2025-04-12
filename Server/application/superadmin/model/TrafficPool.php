<?php
namespace app\superadmin\model;

use think\Model;

/**
 * 客户池模型
 */
class TrafficPool extends Model
{
    // 设置数据表名
    protected $name = 'traffic_pool';
    
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
        'wechatId' => 'string',
        'createTime' => 'datetime',
        'updateTime' => 'integer'
    ];
    
    // 定义字段验证规则
    protected $rule = [
        'wechatId' => 'require|max:64',
        'identifier' => 'require|max:64'
    ];
    
    // 定义字段验证提示信息
    protected $message = [
        'wechatId.require' => '微信ID不能为空',
        'wechatId.max' => '微信ID最多不能超过64个字符',
        'identifier.require' => '标识符不能为空',
        'identifier.max' => '标识符最多不能超过64个字符'
    ];
} 