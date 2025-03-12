<?php

namespace app\backend\controller;

use app\common\model\ProductContentPoolModel;

class ProductContentPoolController extends BaseLoginController {

    /**
     * 获取关联数组
     *
     * @return \think\response\Json
     */
    public function assoc() {
        return $this->jsonSucc(ProductContentPoolModel::assoc());
    }

    /**
     * 保存
     *
     * @return \think\response\Json
     * @throws \Exception
     */
    public function save() {
        $contents = $this->request->param('contents');
        if (!is_array($contents)) {
            return $this->jsonFail('参数错误');
        }

        for ($i = 1; $i <= 6; $i ++) {
            if (isset($contents[$i])) {
                $content = trim($contents[$i]);
                $content = trim($content, '-');
                $content = trim($content);
                if (!empty($content)) {
                    $model   = ProductContentPoolModel::where(1)
                        ->where('number', $i)
                        ->find();
                    if (empty($model)) {
                        $model = new ProductContentPoolModel();
                    }
                    $model->number  = $i;
                    $model->content = trim($content);
                    $model->save();
                } else {
                    ProductContentPoolModel::where(1)
                        ->where('number', $i)
                        ->delete();
                }
            } else {
                ProductContentPoolModel::where(1)
                    ->where('number', $i)
                    ->delete();
            }
        }

        return $this->jsonSucc();
    }
}