<?php

namespace app\common\model;

use think\Model;

class DeviceModel extends Model {

    const ACTIVE_TIME = 60;

    const IS_ONLINE_NO = 0;
    const IS_ONLINE_YES = 10;

    const STATUS_ACTIVE = 0;
    const STATUS_DISABLE = 99;

    /**
     * 获取关联数组
     *
     * @return array
     */
    static public function assoc() {
        static $assoc = NULL;
        if (is_null($assoc)) {
            $assoc = [];
            foreach (static::where(1)
                    ->order('id', 'DESC')
                    ->select() as $model) {
                $assoc[$model->getAttr('id')] = $model->getAttr('number')
                    . ($model->isOnline() ? '[在线]' : '[离线]');
            }
        }
        return $assoc;
    }

    /**
     * 是否在线
     *
     * @return string[]
     */
    static public function isOnlineAssoc() {
        return [
            static::IS_ONLINE_YES => '在线',
            static::IS_ONLINE_NO  => '离线',
        ];
    }

    /**
     * 获取状态
     *
     * @return string[]
     */
    static public function statusAssoc() {
        return [
            static::STATUS_ACTIVE  => '正常',
            static::STATUS_DISABLE => '停用',
        ];
    }

    /**
     * 设备是否在线
     *
     * @return bool
     */
    public function isOnline() {
        return $this->getAttr('is_online') == static::IS_ONLINE_YES
            AND time() - $this->getAttr('active_time') <= static::ACTIVE_TIME;
    }
}