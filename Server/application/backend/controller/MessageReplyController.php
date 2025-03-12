<?php

namespace app\backend\controller;

use app\common\model\TaskModel;

class MessageReplyController extends BaseLoginController {

    /**
     * 关闭
     *
     * @return \think\response\Json
     */
    public function close() {
        $devices  = $this->request->param('devices');
        if (empty($devices) OR !is_array($devices)) {
            return $this->jsonFail('参数错误');
        }

        TaskModel::where(1)
            ->whereIn('device_id', $devices)
            ->where('platform', TaskModel::PLATFORM_XIANYU)
            ->whereIn('status', [TaskModel::STATUS_AWAIT, TaskModel::STATUS_ALLOC])
            ->where('is_deleted', TaskModel::IS_DELETED_NO)
            ->update([
                'is_deleted'  => TaskModel::IS_DELETED_YES,
                'update_time' => time(),
            ]);

        return $this->jsonSucc();
    }
}