<?php

namespace app\backend\controller;

use app\common\model\DeviceModel;
use think\db\Query;

class DeviceController extends BaseLoginController {

    /**
     * 获取列表
     *
     * @return \think\response\Json
     */
    public function index() {
        $isOnline  = intval($this->request->param('is_online'));
        $status    = trim($this->request->param('status'));
        $keywords  = trim($this->request->param('keywords'));
        $pageNo    = intval($this->request->param('page'));
        $pageSize  = intval($this->request->param('pageSize'));
        if ($pageNo <= 0) {
            $pageNo = 1;
        }
        if ($pageSize <= 0) {
            $pageSize = 30;
        }

        $onlines = [
            1 => '在线',
            2 => '离线',
        ];

        $query = DeviceModel::where(1);
        if (isset(DeviceModel::statusAssoc()[$status])) {
            $query->where('status', $status);
        }

        if ($isOnline == 1) {
            $query->where('is_online', DeviceModel::IS_ONLINE_YES);
            $query->where('active_time', '>=', time() - DeviceModel::ACTIVE_TIME);
        } elseif ($isOnline == 2) {
            $query->where(function (Query $q) {
                $q->whereOr('is_online', DeviceModel::IS_ONLINE_NO);
                $q->whereOr('active_time', '<', time() - DeviceModel::ACTIVE_TIME);
            });
        }

        if (!empty($keywords)) {
            $query->where(function (Query $q) use ($keywords) {
                $q->whereLike('number', '%' . $keywords . '%', 'OR');
                $q->whereLike('ip', '%' . $keywords . '%', 'OR');
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
                'is_online'      => $model->isOnline() ? 1 : 2,
                'is_online_name' => $onlines[$model->isOnline() ? 1 : 2],
                'status_name'    => DeviceModel::statusAssoc()[$model->status],
                'active_time'    => date('Y-m-d H:i:s', $model->active_time),
            ]);
        }

        return $this->jsonSucc([
            'list'       => $list,
            'page'       => $pageNo,
            'pageCount'  => $pageCount,
            'totalCount' => $totalCount,
            'statuses'   => $this->assocToList(DeviceModel::statusAssoc()),
            'onlines'    => $this->assocToList($onlines),
        ]);
    }

    /**
     * 获取关联数组
     *
     * @return \think\response\Json
     */
    public function assoc() {
        return $this->jsonSucc($this->assocToList(DeviceModel::assoc()));
    }
}