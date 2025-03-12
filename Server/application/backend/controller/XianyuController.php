<?php

namespace app\backend\controller;

use app\common\model\XianyuModel;
use think\db\Query;

class XianyuController extends BaseLoginController {

    /**
     * 闲鱼列表
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

        $query = XianyuModel::where(1);
        if (!empty($keywords)) {
            $query->where(function (Query $q) use ($keywords) {
                $q->whereLike('username', '%' . $keywords . '%', 'OR');
                $q->whereLike('nickname', '%' . $keywords . '%', 'OR');
                $q->whereLike('remark', '%' . $keywords . '%', 'OR');
            });
        }

        $totalCount = $query->count();
        $pageCount  = $totalCount > 0 ? ceil($totalCount / $pageSize) : 1;
        if ($pageNo > $pageCount) {
            $pageNo = $pageCount;
        }

        $query->order('id', 'DESC');
        $query->limit(($pageNo - 1) * $pageSize, $pageSize);

        $list  = [];
        foreach ($query->select() as $model) {
            $list[] = array_merge($model->toArray(), [

            ]);
        }

        return $this->jsonSucc([
            'list'       => $list,
            'page'       => $pageNo,
            'pageCount'  => $pageCount,
            'totalCount' => $totalCount,
        ]);
    }

    public function update() {
        
    }

    /**
     * 备注
     *
     * @return \think\response\Json
     */
    public function remark() {
        $id     = intval($this->request->param('id'));
        $remark = trim($this->request->param('remark'));
        if (empty($id)) {
            return $this->jsonFail('参数错误');
        }

        $model = XianyuModel::get($id);
        if (empty($model)) {
            return $this->jsonFail('对象未找到');
        }

        $model->remark = $remark;
        $model->save();

        return $this->jsonSucc();
    }
}