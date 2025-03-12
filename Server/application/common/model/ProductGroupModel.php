<?php

namespace app\common\model;

use think\Model;

class ProductGroupModel extends Model {

    /**
     * 获取关联数组
     *
     * @return array
     */
    static public function assoc() {
        $assoc = NULL;
        if (is_null($assoc)) {
            $assoc = [];
            foreach (static::where(1)
                    ->order('id', 'DESC')
                    ->select() as $model) {
                $assoc[$model->getAttr('id')] = $model->getAttr('name');
            }
        }
        return $assoc;
    }

    /**
     * 商品数量
     *
     * @return ProductModel
     */
    public function productNum() {
        return ProductModel::where(1)
            ->where('group_id', $this->getAttr('id'))
            ->count();
    }
}