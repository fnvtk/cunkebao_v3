<?php

namespace app\common\model;

use think\Model;

/**
 * 微信好友模型类
 */
class DeviceWechatLogin extends Model
{
    // 登录日志最新登录 alive = 1，旧数据全部设置0
    protected $name = 'device_wechat_login';

    // 自动写入时间戳
    protected $autoWriteTimestamp = true;
    protected $createTime = 'createTime';
    protected $updateTime = 'updateTime';

} 