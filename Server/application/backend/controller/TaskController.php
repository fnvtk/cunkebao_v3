<?php

namespace app\backend\controller;

use app\common\model\DeviceModel;
use app\common\model\LogModel;
use app\common\model\TaskDetailModel;
use app\common\model\TaskModel;

class TaskController extends BaseLoginController {

    /**
     * 获取列表
     *
     * @return \think\response\Json
     */
    public function index() {
        $deviceId  = intval($this->request->param('device_id'));
        $type      = trim($this->request->param('type'));
        $runType   = trim($this->request->param('run_type'));
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

        $query = TaskModel::where(1)
            ->alias('t1')
            ->field('t1.*')
            ->leftJoin(
                DeviceModel::where(1)->getTable() . ' t2',
                't2.id = t1.device_id')
            ->where('t1.is_deleted', TaskModel::IS_DELETED_NO);
        if (!empty($deviceId)) {
            $query->where('t1.device_id', $deviceId);
        }
        if (isset(TaskModel::typeAssoc()[$type])) {
            $query->where('t1.type', $type);
        }
        if (isset(TaskModel::statusAssoc()[$status])) {
            $query->where('t1.status', $status);
        }
        if (isset(TaskModel::runTypeAssoc()[$runType])) {
            $query->where('t1.run_type', $runType);
        }
        if (!empty($keywords)) {
            $query->whereLike('t2.number', '%' . $keywords . '%');
        }

        $totalCount = $query->count();
        $pageCount  = $totalCount > 0 ? ceil($totalCount / $pageSize) : 1;
        if ($pageNo > $pageCount) {
            $pageNo = $pageCount;
        }

        $query->order('t1.id', 'DESC');
        $query->limit(($pageNo - 1) * $pageSize, $pageSize);

        $list  = [];
        foreach ($query->select() as $model) {
            $device = $model->device();
            $list[] = array_merge($model->toArray(), [
                'device_number'  => $device ? $device->number : '',
                'device_name'    => $device ? $device->name : '',
                'device_online'  => ($device AND $device->isOnline()) ? '在线' : '离线',
                'type_name'      => TaskModel::typeAssoc()[$model->type],
                'run_type_name'  => TaskModel::runTypeAssoc()[$model->run_type],
                'status_name'    => TaskModel::statusAssoc()[$model->status],
            ]);
        }

        return $this->jsonSucc([
            'list'       => $list,
            'page'       => $pageNo,
            'pageCount'  => $pageCount,
            'totalCount' => $totalCount,
            'platforms'  => $this->assocToList(TaskModel::platformAssoc()),
            'types'      => $this->assocToList(TaskModel::typeAssoc()),
            'runTypes'   => $this->assocToList(TaskModel::runTypeAssoc()),
            'statuses'   => $this->assocToList(TaskModel::statusAssoc()),
        ]);
    }

    /**
     * 日志
     *
     * @return \think\response\Json
     */
    public function log() {
        $id = intval($this->request->param('id'));
        if (empty($id)) {
            return $this->jsonFail('参数错误');
        }

        $detail = TaskDetailModel::where(1)
            ->where('task_id', $id)
            ->order('id', 'DESC')
            ->find();
        if (empty($detail)) {
            return $this->jsonSucc([]);
        }

        $list = [];
        foreach (LogModel::where(1)
                ->where('task_id', $detail->id)
                ->order('id', 'ASC')
                ->select() as $model) {
            $list[] = [
                'id'          => $model->id,
                'type'        => $model->type,
                'message'     => $model->message,
                'create_time' => $model->create_time,
            ];
        }
        return $this->jsonSucc($list);
    }

    /**
     * 保存
     *
     * @return \think\response\Json
     */
    public function save() {
        $devices  = $this->request->param('devices');
        $platform = trim($this->request->param('platform'));
        $type     = trim($this->request->param('type'));
        $runType  = trim($this->request->param('run_type'));
        $runTime  = trim($this->request->param('run_time'));
        if (empty($devices)
                OR !is_array($devices)
                OR !isset(TaskModel::platformAssoc()[$platform])
                OR !isset(TaskModel::typeAssoc()[$type])
                OR !isset(TaskModel::runTypeAssoc()[$runType])) {
            return $this->jsonFail('参数错误');
        }
        $timeTypes = [TaskModel::RUN_TYPE_TIMER, TaskModel::RUN_TYPE_DAILY];
        if (in_array($runType, $timeTypes)
                AND empty($runTime)) {
            return $this->jsonFail('参数错误');
        }

        $params = call_user_func_array(TaskModel::taskClasses()[$type] . '::params', [$this->request]);
        if (is_null($params)) {
            return $this->jsonFail('参数错误');
        }

        foreach ($devices as $deviceId) {
            $model = new TaskModel();
            $model->platform  = $platform;
            $model->type      = $type;
            $model->device_id = $deviceId;
            $model->params    = $params;
            $model->run_type  = $runType;
            $model->run_time  = in_array($runType, $timeTypes) ? $runTime : '';
            $model->save();
        }

        return $this->jsonSucc();
    }

    /**
     * 删除
     *
     * @return \think\response\Json
     */
    public function delete() {
        $id = intval($this->request->param('id'));
        if (empty($id)) {
            return $this->jsonFail('参数错误');
        }

        $model = TaskModel::get($id);
        if (empty($model)) {
            return $this->jsonFail('对象未找到');
        }

        TaskDetailModel::where(1)
            ->where('task_id', $model->id)
            ->update([
                'is_deleted' => TaskModel::IS_DELETED_YES,
            ]);

        $model->is_deleted = TaskModel::IS_DELETED_YES;
        $model->save();

        return $this->jsonSucc();
    }

    /**
     * 批量删除
     *
     * @return \think\response\Json
     */
    public function batchDelete() {
        $ids = $this->request->param('ids');
        if (empty($ids) OR !is_array($ids)) {
            return $this->jsonFail('参数错误');
        }

        TaskDetailModel::where(1)
            ->whereIn('task_id', $ids)
            ->update([
                'is_deleted' => TaskModel::IS_DELETED_YES,
            ]);

        TaskModel::where(1)
            ->whereIn('id', $ids)
            ->update([
                'is_deleted' => TaskModel::IS_DELETED_YES,
            ]);

        return $this->jsonSucc();
    }

    /**
     * 获取执行方式
     *
     * @return \think\response\Json
     */
    public function runTypeAssoc() {
        return $this->jsonSucc($this->assocToList(TaskModel::runTypeAssoc()));
    }
}