<?php

namespace app\common\model;

use think\Model;

class WechatAccountModel extends Model
{
    protected $table = 'wechat_account';
    protected $pk = 'id';
    
    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';

    // 数据表字段采用驼峰式命名
    protected $convertNameToCamel = true;
} 