<?php

namespace app\backend\controller;

use app\common\model\DeviceModel;
use app\common\model\XianyuModel;
use app\common\model\XianyuShopModel;
use think\db\Query;

class XianyuShopController extends BaseLoginController {

    /**
     * 列表
     *
     * @return \think\response\Json
     */
    public function index() {
        $username  = trim($this->request->param('username'));
        $keywords  = trim($this->request->param('keywords'));
        $pageNo    = intval($this->request->param('page'));
        $pageSize  = intval($this->request->param('pageSize'));
        if ($pageNo <= 0) {
            $pageNo = 1;
        }
        if ($pageSize <= 0) {
            $pageSize = 30;
        }

        $query = XianyuShopModel::where(1);
        if (!empty($username)) {
            $query->where('username', $username);
        }
        if (!empty($keywords)) {
            $query->where(function (Query $q) use ($keywords) {
                //$q->whereLike('title', '%' . $keywords . '%', 'OR');
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
            $device = DeviceModel::get($model->device_id);
            $xianyu = XianyuModel::get(['username' => $model->username]);
            $list[] = array_merge($model->toArray(), [
                'device_number' => $device ? $device->number : '',
                'nickname'      => $xianyu ? $xianyu->nickname : '',
            ]);
        }

        return $this->jsonSucc([
            'list'       => $list,
            'page'       => $pageNo,
            'pageCount'  => $pageCount,
            'totalCount' => $totalCount,
            'xianyus'    => $this->assocToList(XianyuModel::assoc()),
        ]);
    }
}