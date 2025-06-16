<?php

namespace app\cunkebao\controller\plan;

use library\ResponseHelper;
use think\Db;
use app\cunkebao\controller\BaseController;
/**
 * 获取计划任务列表控制器
 */
class PlanSceneV1Controller extends BaseController
{
    /**
     * 获取计划任务列表
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->param();
            $page = isset($params['page']) ? intval($params['page']) : 1;
            $limit = isset($params['limit']) ? intval($params['limit']) : 10;
            $sceneId = $this->request->param('sceneId','');
            $where = [
                'deleteTime' => 0,
                'companyId' => $this->getUserInfo('companyId'),
            ];
    
            if($this->getUserInfo('isAdmin')){
                $where['userId'] = $this->getUserInfo('id');
            }

            if(!empty($sceneId)){
                $where['sceneId'] = $sceneId;
            }


            $total = Db::name('customer_acquisition_task')->where($where)->count();
            $list = Db::name('customer_acquisition_task')
                ->where($where)
                ->order('createTime', 'desc')
                ->page($page, $limit)
                ->select();

                foreach($list as &$val){
                    $val['createTime'] = date('Y-m-d H:i:s', $val['createTime']);
                    $val['updateTime'] = date('Y-m-d H:i:s', $val['updateTime']);
                    $val['sceneConf'] = json_decode($val['sceneConf'],true);
                    $val['reqConf'] = json_decode($val['reqConf'],true);
                    $val['msgConf'] = json_decode($val['msgConf'],true);
                    $val['tagConf'] = json_decode($val['tagConf'],true);
                }
                unset($val);



            return ResponseHelper::success([
                'total' => $total,
                'list' => $list
            ], '获取计划任务列表成功');
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 拷贝计划任务
     *
     * @return \think\response\Json
     */
    public function copy()
    {
        try {
            $params = $this->request->param();
            $planId = isset($params['planId']) ? intval($params['planId']) : 0;

            if ($planId <= 0) {
                return ResponseHelper::error('计划ID不能为空', 400);
            }

            $plan = Db::name('customer_acquisition_task')->where('id', $planId)->find();
            if (!$plan) {
                return ResponseHelper::error('计划不存在', 404);
            }

            unset($plan['id']);
            $plan['name'] = $plan['name'] . ' (拷贝)';
            $plan['createTime'] = time();
            $plan['updateTime'] = time();

            $newPlanId = Db::name('customer_acquisition_task')->insertGetId($plan);
            if (!$newPlanId) {
                return ResponseHelper::error('拷贝计划失败', 500);
            }

            return ResponseHelper::success(['planId' => $newPlanId], '拷贝计划任务成功');
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 删除计划任务
     *
     * @return \think\response\Json
     */
    public function delete()
    {
        try {
            $params = $this->request->param();
            $planId = isset($params['planId']) ? intval($params['planId']) : 0;

            if ($planId <= 0) {
                return ResponseHelper::error('计划ID不能为空', 400);
            }

            $result = Db::name('customer_acquisition_task')->where('id', $planId)->update(['deleteTime' => time()]);
            if (!$result) {
                return ResponseHelper::error('删除计划失败', 500);
            }

            return ResponseHelper::success([], '删除计划任务成功');
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 修改计划任务状态
     *
     * @return \think\response\Json
     */
    public function updateStatus()
    {
        try {
            $params = $this->request->param();
            $planId = isset($params['planId']) ? intval($params['planId']) : 0;
            $status = isset($params['status']) ? intval($params['status']) : 0;

            if ($planId <= 0) {
                return ResponseHelper::error('计划ID不能为空', 400);
            }

            $result = Db::name('customer_acquisition_task')->where('id', $planId)->update(['status' => $status, 'updateTime' => time()]);
            if (!$result) {
                return ResponseHelper::error('修改计划状态失败', 500);
            }

            return ResponseHelper::success([], '修改计划任务状态成功');
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }
} 