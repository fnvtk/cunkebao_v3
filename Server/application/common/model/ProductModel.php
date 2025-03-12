<?php

namespace app\common\model;

use think\Model;

class ProductModel extends Model {

    const IS_USED_NO = 0;
    const IS_USED_YES = 10;

    protected $json = ['cb', 'images', 'labels', 'themes', 'opts'];
    protected $jsonAssoc = TRUE;

    /**
     * 获取是否使用
     *
     * @return string[]
     */
    static public function isUsedAssoc() {
        return [
            static::IS_USED_NO  => '未使用',
            static::IS_USED_YES => '已使用',
        ];
    }
}