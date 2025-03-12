<?php

namespace app\backend\controller;

use app\common\model\ProductModel;
use app\common\model\ProductUseModel;
use app\common\model\TaskModel;
use app\common\task\ProductReleaseTask;

class ProductReleaseController extends BaseLoginController {

    /**
     * 保存
     *
     * @return \think\response\Json
     */
    public function save() {
        $devices = $this->request->param('devices');
        $params  = ProductReleaseTask::params($this->request);
        if (empty($devices)
                OR !is_array($devices)
                OR is_null($params)) {
            return $this->jsonFail('参数错误');
        }

        foreach ($devices as $deviceId) {
            $pdts = [];
            for ($i = 0; $i < $params['release_num']; $i ++) {
                $product = array_shift($params['products']);
                if (!empty($product)) {
                    $pdts[] = $product;
                }
            }
            if (!empty($pdts)) {
                $model = new TaskModel();
                $model->device_id = $deviceId;
                $model->platform  = TaskModel::PLATFORM_XIANYU;
                $model->type      = TaskModel::TYPE_PRODUCT_RELEASE;
                $model->params    = array_merge($params, ['products' => $pdts]);
                $model->run_type  = TaskModel::RUN_TYPE_ONCE;
                $model->run_time  = '';
                if ($model->save()) {
                    foreach ($pdts as $pdt) {
                        $useModel = new ProductUseModel();
                        $useModel->device_id  = $deviceId;
                        $useModel->release_id = $model->id;
                        $useModel->product_id = $pdt['id'];
                        $useModel->use_type   = $model->platform;
                        $useModel->save();

                        ProductModel::where(1)
                            ->where('id', $pdt['id'])
                            ->update([
                                'is_used' => ProductModel::IS_USED_YES,
                            ]);
                    }
                }
            }
        }

        return $this->jsonSucc();
    }
}