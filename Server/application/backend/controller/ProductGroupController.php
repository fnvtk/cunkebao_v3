<?php

namespace app\backend\controller;

use app\common\model\CollectProductModel;
use app\common\model\ProductGroupModel;
use app\common\model\ProductModel;
use think\db\Query;

class ProductGroupController extends BaseLoginController {

    /**
     * 获取列表
     *
     * @return \think\response\Json
     */
    public function index() {
        $keywords  = trim($this->request->param('keywords'));
        $pageNo    = intval($this->request->param('page'));
        $pageSize  = intval($this->request->param('pageSize'));
        if ($pageNo <= 0) {
            $pageNo = 1;
        }
        if ($pageSize <= 0) {
            $pageSize = 30;
        }

        $query = ProductGroupModel::where(1);
        if (!empty($keywords)) {
            $query->where(function (Query $q) use ($keywords) {
                $q->whereLike('name', '%' . $keywords . '%', 'OR');
            });
        }

        $totalCount = $query->count();
        $pageCount  = $totalCount > 0 ? ceil($totalCount / $pageSize) : 1;
        if ($pageNo > $pageCount) {
            $pageNo = $pageCount;
        }

        $query->order('id', 'DESC');
        $query->limit(($pageNo - 1) * $pageSize, $pageSize);

        $list = [];
        foreach ($query->select() as $model) {
            $list[] = array_merge($model->toArray(), [
                'product_num' => $model->productNum(),
            ]);
        }

        return $this->jsonSucc([
            'list'       => $list,
            'page'       => $pageNo,
            'pageCount'  => $pageCount,
            'totalCount' => $totalCount,
        ]);
    }

    /**
     * 保存
     *
     * @return \think\response\Json
     */
    public function save() {
        $id   = intval($this->request->param('id'));
        $name = trim($this->request->param('name'));
        if (empty($name)) {
            return $this->jsonFail('参数错误');
        }

        if (!empty($id)) {
            $model = ProductGroupModel::get($id);
            if (empty($model)) {
                return $this->jsonFail('对象未找到');
            }
        } else {
            $model = new ProductGroupModel();
        }

        $model->name = $name;
        $model->save();

        return $this->jsonSucc();
    }

    /**
     * 删除
     *
     * @return \think\response\Json
     * @throws \Exception
     */
    public function delete() {
        $id = intval($this->request->param('id'));
        if (empty($id)) {
            return $this->jsonFail('参数错误');
        }

        $model = ProductGroupModel::get($id);
        if (empty($model)) {
            return $this->jsonFail('对象未找到');
        }

        CollectProductModel::where(1)
            ->where('group_id', $model->id)
            ->update([
                'group_id' => 0,
            ]);
        ProductModel::where(1)
            ->where('group_id', $model->id)
            ->update([
                'group_id' => 0,
            ]);

        $model->delete();

        return $this->jsonSucc();
    }
}