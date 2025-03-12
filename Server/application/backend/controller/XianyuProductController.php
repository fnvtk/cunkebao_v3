<?php

namespace app\backend\controller;

use app\common\model\DeviceModel;
use app\common\model\XianyuProductModel;
use app\common\model\XianyuModel;
use think\db\Query;

class XianyuProductController extends BaseLoginController {

    /**
     * 列表
     *
     * @return \think\response\Json
     */
    public function index() {
        $username  = trim($this->request->param('username'));
        $onSale    = trim($this->request->param('on_sale'));
        $keywords  = trim($this->request->param('keywords'));
        $pageNo    = intval($this->request->param('page'));
        $pageSize  = intval($this->request->param('pageSize'));
        if ($pageNo <= 0) {
            $pageNo = 1;
        }
        if ($pageSize <= 0) {
            $pageSize = 30;
        }

        $query = XianyuProductModel::where(1);
        if (!empty($username)) {
            $query->where('username', $username);
        }
        if (isset(XianyuProductModel::onSaleAssoc()[$onSale])) {
            $query->where('on_sale', $onSale);
        }

        if (!empty($keywords)) {
            $query->where(function (Query $q) use ($keywords) {
                $q->whereLike('title', '%' . $keywords . '%', 'OR');
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
                'on_sale_name'  => XianyuProductModel::onSaleAssoc()[$model->on_sale],
                'nickname'      => $xianyu ? $xianyu->nickname : '',
            ]);
        }

        return $this->jsonSucc([
            'list'       => $list,
            'page'       => $pageNo,
            'pageCount'  => $pageCount,
            'totalCount' => $totalCount,
            'xianyus'    => $this->assocToList(XianyuModel::assoc()),
            'onSales'    => $this->assocToList(XianyuProductModel::onSaleAssoc()),
        ]);
    }
}