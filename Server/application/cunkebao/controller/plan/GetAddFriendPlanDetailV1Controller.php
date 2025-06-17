<?php

namespace app\cunkebao\controller\plan;

use library\ResponseHelper;
use think\Controller;
use think\Db;

/**
 * 获取获客计划详情控制器
 */
class GetAddFriendPlanDetailV1Controller extends Controller
{
    /**
     * 获取计划详情
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $planId = $this->request->param('planId');
            
            if (empty($planId)) {
                return ResponseHelper::error('计划ID不能为空', 400);
            }

            // 查询计划详情
            $plan = Db::name('customer_acquisition_task')
                ->where('id', $planId)
                ->find();

            if (!$plan) {
                return ResponseHelper::error('计划不存在', 404);
            }

            // 解析JSON字段
            $sceneConf = json_decode($plan['sceneConf'], true) ?: [];
            $reqConf = json_decode($plan['reqConf'], true) ?: [];
            $msgConf= json_decode($plan['msgConf'], true) ?: [];
            $tagConf = json_decode($plan['tagConf'], true) ?: [];

            $newData['messagePlans'] = $msgConf;
            $newData = array_merge($newData,$sceneConf,$reqConf,$tagConf,$plan);
            unset(
                $newData['sceneConf'],
                $newData['reqConf'],
                $newData['msgConf'],
                $newData['tagConf'],
                $newData['userInfo'],
                $newData['createTime'],
                $newData['updateTime'],
                $newData['deleteTime'],
            );

        

            return ResponseHelper::success($newData, '获取计划详情成功');
            
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }
} 