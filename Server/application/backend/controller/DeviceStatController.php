<?php

namespace app\backend\controller;

use think\db\Query;

class DeviceStatController extends BaseLoginController {

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

        $query = DeviceStatModel::where(1);
        if (!empty($keywords)) {
            $query->where(function (Query $q) use ($keywords) {
                $q->whereLike('days', '%' . $keywords . '%', 'OR');
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
        if ($pageNo <= 1) {
            $num = DeviceQqModel::where(1)
                ->where('create_time', '>=', 1724860800)
                ->count();
            $succNum = DeviceQqModel::where(1)
                ->where('create_time', '>=', 1724860800)
                ->where('status', DeviceQqModel::STATUS_SUCC)
                ->count();
            $rewardTotal = floatval(DeviceQqModel::where(1)
                ->where('create_time', '>=', 1724860800)
                ->where('status', DeviceQqModel::STATUS_SUCC)
                ->sum('reward'));
            $rewardPrice = 0;
            if ($succNum > 0) {
                $rewardPrice = round($rewardTotal / $succNum, 2);
            }
            $finishTime = intval(DeviceQqModel::where(1)
                ->where('create_time', '>=', 1724860800)
                ->where('finish_time', '>', 0)
                ->avg('finish_time'));
            $createTime = intval(DeviceQqModel::where(1)
                ->where('create_time', '>=', 1724860800)
                ->where('finish_time', '>', 0)
                ->avg('create_time'));
            $succFinishTime = intval(DeviceQqModel::where(1)
                ->where('create_time', '>=', 1724860800)
                ->where('status', DeviceQqModel::STATUS_SUCC)
                ->where('finish_time', '>', 0)
                ->avg('finish_time'));
            $succCreateTime = intval(DeviceQqModel::where(1)
                ->where('create_time', '>=', 1724860800)
                ->where('status', DeviceQqModel::STATUS_SUCC)
                ->where('finish_time', '>', 0)
                ->avg('create_time'));

            $succRate     = $num > 0 ? round($succNum / $num * 100, 2) : 0;
            $failNum      = $num - $succNum;
            $failRate     = $num > 0 ? round($failNum / $num * 100, 2) : 0;
            $succFailRate = 0;
            if ($num > $succNum) {
                $succFailRate = $succNum / ($num - $succNum);
                $succFailRate = round($succFailRate * 100, 2);
            }

            $failInfo = [];
            foreach (DeviceQqModel::where(1)
                    ->field('remark, COUNT(id) AS num')
                    ->where('create_time', '>=', 1724860800)
                    ->whereNotIn('status', [DeviceQqModel::STATUS_REG, DeviceQqModel::STATUS_SUCC])
                    ->group('remark')
                    ->select() as $infoModel) {
                if ($infoModel->remark) {

                    $failInfo[] = [
                        'title' => $infoModel->remark,
                        'num'   => $infoModel->num,
                        'rate'  => $num > 0 ? round($infoModel->num / $num * 100, 2) : 0,
                    ];
                }
            }

            $list[] = [
                'days'           => '合计',
                'num'            => $num,
                'succ_num'       => $succNum,
                'reward_price'   => $rewardPrice,
                'reward_total'   => $rewardTotal,
                'avg_time'       => $finishTime > $createTime ? $finishTime - $createTime : 0,
                'avg_succ_time'  => $succFinishTime > $succCreateTime ? $succFinishTime - $succCreateTime : 0,
                'succ_fail_rate' => $succFailRate,
                'succ_rate' => $succRate,
                'fail_num'  => $failNum,
                'fail_rate' => $failRate,
                'fail_info' => $failInfo,
            ];
        }
        foreach ($query->select() as $model) {
            $succRate     = 0;
            $failNum      = $model->num > $model->succ_num ? $model->num - $model->succ_num : 0;
            $failRate     = 0;
            $succFailRate = 0;
            if ($model->num > 0) {
                $succRate = $model->succ_num / $model->num;
                $succRate = round($succRate * 100, 2);
                $failRate = $failNum / $model->num;
                $failRate = round($failRate * 100, 2);
            }
            if ($model->num > $model->succ_num) {
                $succFailRate = $model->succ_num / ($model->num - $model->succ_num);
                $succFailRate = round($succFailRate * 100, 2);
            }

            $list[] = array_merge($model->toArray(), [
                'reward_price'   => floatval($model->reward_price),
                'reward_total'   => floatval($model->reward_total),
                'succ_fail_rate' => $succFailRate,
                'fail_num'       => $failNum,
                'succ_rate'      => $succRate,
                'fail_rate'      => $failRate,
            ]);
        }

        return $this->jsonSucc([
            'list'       => $list,
            'page'       => $pageNo,
            'pageCount'  => $pageCount,
            'totalCount' => $totalCount,
        ]);
    }
}