<?php

namespace app\cunkebao\model;

use think\Model;

/**
 * 微信账号模型类
 */
class WechatAccount extends Model
{
    // 设置表名
    protected $name = 'wechat_account';

    /**
     * 获取在线微信账号数量
     *
     * @param array $where 额外的查询条件
     * @return int 微信账号数量
     */
    public static function getOnlineWechatCount($where = [])
    {
        $condition = [
            'deviceAlive' => 1,
            'wechatAlive' => 1,
            'isDeleted'   => 0
        ];

        // 合并额外条件
        if (!empty($where)) {
            $condition = array_merge($condition, $where);
        }

        return self::where($condition)->count();
    }

    /**
     * 获取有登录微信的设备数量
     *
     * @param array $where 额外的查询条件
     * @return int 设备数量
     */
    public static function getDeviceWithWechatCount($where = [])
    {
        $condition = [
            'deviceAlive' => 1,
            'isDeleted'   => 0
        ];

        // 合并额外条件
        if (!empty($where)) {
            $condition = array_merge($condition, $where);
        }

        return self::where($condition)->count();
    }
} 