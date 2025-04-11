<?php
namespace app\superadmin\model;

use think\Model;

/**
 * 微信好友模型
 */
class WechatFriend extends Model
{
    // 设置数据表名
    protected $name = 'wechat_friend';
    
    // 不使用自增主键
    protected $pk = null;
    
    // 指定自动时间字段的格式
    protected $autoWriteTimestamp = 'datetime';
    
    // 定义时间戳字段名
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';
    
    // 定义字段类型
    protected $type = [
        'id' => 'integer',
        'wechatAccountId' => 'integer',
        'gender' => 'integer',
        'addFrom' => 'integer',
        'isDeleted' => 'integer',
        'isPassed' => 'integer',
        'accountId' => 'integer',
        'groupId' => 'integer',
        'updateTime' => 'integer',
        'labels' => 'json',
        'extendFields' => 'json',
        'thirdParty' => 'json',
        'deleteTime' => 'datetime',
        'passTime' => 'datetime',
        'createTime' => 'datetime'
    ];
} 