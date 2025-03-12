<?php

namespace app\common\model;

use think\Model;

class UserModel extends Model {

    const STATUS_ACTIVE  = 0;  // 正常
    const STATUS_DISABLE = 99;  // 禁用

    /**
     * 获取状态
     *
     * @return string[]
     */
    public static function statusAssoc() {
        return [
            static::STATUS_ACTIVE  => '正常',
            static::STATUS_DISABLE => '禁用',
        ];
    }

    /**
     * 只读
     *
     * @var array
     */
    protected $readonly = ['username'];

    /**
     * JSON 字段
     *
     * @var array
     */
    protected $json = ['roles'];

    protected $jsonAssoc = TRUE;
}