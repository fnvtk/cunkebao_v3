<?php

namespace app\backend\controller;

use app\common\model\CollectProductModel;
use app\common\model\ProductGroupModel;
use think\db\Query;

class CollectProductController extends BaseLoginController {

    /**
     * 获取列表
     *
     * @return \think\response\Json
     */
    public function index() {
        $parentId  = intval($this->request->param('parent_id'));
        $type      = trim($this->request->param('type'));
        $video     = trim($this->request->param('video'));
        $repeat    = trim($this->request->param('repeat'));
        $groupId   = intval($this->request->param('group_id'));
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

        $query = CollectProductModel::where(1);
        if (!empty($parentId)) {
            $query->where('parent_id', $parentId);
        } else {
            $query->where('parent_id', 0);
        }
        if (isset(CollectProductModel::typeAssoc()[$type])) {
            $query->where('type', $type);
        }
        if (isset(CollectProductModel::videoAssoc()[$video])) {
            $query->where('video', $video);
        }
        if (isset(CollectProductModel::repeatAssoc()[$repeat])) {
            $query->where('repeat', $repeat);
        }
        if (isset(CollectProductModel::statusAssoc()[$status])) {
            $query->where('status', $status);
        }
        if (!empty($groupId)) {
            $query->where('group_id', $groupId);
        }
        if (!empty($keywords)) {
            $query->where(function (Query $q) use ($keywords) {
                $q->whereLike('src_url', '%' . $keywords . '%', 'OR');
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

        $list  = [];
        foreach ($query->select() as $model) {
            $list[] = array_merge($model->toArray(), [
                'product_num'    => $model->productNum(),
                'status_name'    => CollectProductModel::statusAssoc()[$model->status],
                'video_name'     => CollectProductModel::videoAssoc()[$model->video],
                'repeat_name'    => CollectProductModel::repeatAssoc()[$model->repeat],
                'platform_name'  => CollectProductModel::platformAssoc()[$model->platform],
                'mark_up_rate'   => floatval($model->mark_up_rate),
                'mark_up_val'    => floatval($model->mark_up_val),
                'start_time'     => $model->start_time > 0 ? date('Y-m-d H:i:s', $model->start_time) : '',
                'stop_time'      => $model->stop_time > 0 ? date('Y-m-d H:i:s', $model->stop_time) : '',
                'group_name'     => isset(ProductGroupModel::assoc()[$model->group_id])
                    ? ProductGroupModel::assoc()[$model->group_id]
                    : '',
            ]);
        }

        return $this->jsonSucc([
            'list'       => $list,
            'page'       => $pageNo,
            'pageCount'  => $pageCount,
            'totalCount' => $totalCount,
            'statuses'   => $this->assocToList(CollectProductModel::statusAssoc()),
            'platforms'  => $this->assocToList(CollectProductModel::platformAssoc()),
            'videos'     => $this->assocToList(CollectProductModel::videoAssoc()),
            'repeats'    => $this->assocToList(CollectProductModel::repeatAssoc()),
            'groups'     => $this->assocToList(ProductGroupModel::assoc()),
        ]);
    }

    /**
     * 保存
     *
     * @return \think\response\Json
     */
    public function save() {
        //$id         = intval($this->request->param('id'));
        $type       = trim($this->request->param('type'));
        $srcUrl     = trim($this->request->param('src_url'));
        $video      = intval($this->request->param('video'));
        $repeat     = intval($this->request->param('repeat'));
        $markUpRate = intval($this->request->param('mark_up_rate'));
        $markUpVal  = intval($this->request->param('mark_up_val'));
        $groupId    = intval($this->request->param('group_id'));
        if (empty($srcUrl)
                OR !isset(CollectProductModel::typeAssoc()[$type])
                OR !isset(CollectProductModel::videoAssoc()[$video])
                OR !isset(CollectProductModel::repeatAssoc()[$repeat])) {
            return $this->jsonFail('参数错误');
        }

        if (!empty($id)) {
            $model = CollectProductModel::get($id);
            if (empty($model)) {
                return $this->jsonFail('对象未找到');
            }
        } else {
            $model = new CollectProductModel();
        }

        $platform = '';
        if ($type === CollectProductModel::TYPE_PRODUCT
                AND preg_match('#^https\:\/\/www\.goofish\.com\/item#', $srcUrl)) {
            $platform = CollectProductModel::PLATFORM_XIANYU;
        } elseif ($type === CollectProductModel::TYPE_SHOP
                AND preg_match('#^https\:\/\/www\.goofish\.com\/personal#', $srcUrl)) {
            $platform = CollectProductModel::PLATFORM_XIANYU;
        } else {
            return $this->jsonFail('采集链接错误');
        }

        $model = new CollectProductModel();
        $model->type         = $type;
        $model->src_url      = $srcUrl;
        $model->platform     = $platform;
        $model->target       = CollectProductModel::TARGET_PRODUCT;
        $model->video        = $video;
        $model->repeat       = $repeat;
        $model->mark_up_rate = $markUpRate;
        $model->mark_up_val  = $markUpVal;
        $model->group_id     = $groupId;
        $model->user_id      = $this->userModel->id;
        $model->save();

        return $this->jsonSucc();
    }
}