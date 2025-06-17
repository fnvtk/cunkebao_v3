<?php

namespace app\cunkebao\controller\plan;

use library\ResponseHelper;
use think\Controller;
use think\Db;

/**
 * 更新获客计划控制器
 */
class PostUpdateAddFriendPlanV1Controller extends Controller
{
    /**
     * 更新计划任务
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->param();
            
            // 验证必填字段
            if (empty($params['planId'])) {
                return ResponseHelper::error('计划ID不能为空', 400);
            }
            
            if (empty($params['name'])) {
                return ResponseHelper::error('计划名称不能为空', 400);
            }
            
            if (empty($params['sceneId'])) {
                return ResponseHelper::error('场景ID不能为空', 400);
            }
            
            if (empty($params['device'])) {
                return ResponseHelper::error('请选择设备', 400);
            }

            // 检查计划是否存在
            $plan = Db::name('customer_acquisition_task')
                ->where('id', $params['planId'])
                ->find();

            if (!$plan) {
                return ResponseHelper::error('计划不存在', 404);
            }

            // 归类参数
            $msgConf = isset($params['messagePlans']) ? $params['messagePlans'] : [];
            $tagConf = [
                'scenarioTags' => $params['scenarioTags'] ?? [],
                'customTags'   => $params['customTags'] ?? [],
            ];
            $reqConf = [
                'device'            => $params['device'] ?? [],
                'remarkType'        => $params['remarkType'] ?? '',
                'greeting'          => $params['greeting'] ?? '',
                'addFriendInterval' => $params['addFriendInterval'] ?? '',
                'startTime'         => $params['startTime'] ?? '',
                'endTime'           => $params['endTime'] ?? '',
            ];
            
            // 其余参数归为sceneConf
            $sceneConf = $params;
            unset(
                $sceneConf['planId'],
                $sceneConf['name'],
                $sceneConf['sceneId'],
                $sceneConf['messagePlans'],
                $sceneConf['scenarioTags'],
                $sceneConf['customTags'],
                $sceneConf['device'],
                $sceneConf['remarkType'],
                $sceneConf['greeting'],
                $sceneConf['addFriendInterval'],
                $sceneConf['startTime'],
                $sceneConf['endTime']
            );

            // 构建更新数据
            $data = [
                'name'      => $params['name'],
                'sceneId'   => $params['sceneId'],
                'sceneConf' => json_encode($sceneConf, JSON_UNESCAPED_UNICODE),
                'reqConf'   => json_encode($reqConf, JSON_UNESCAPED_UNICODE),
                'msgConf'   => json_encode($msgConf, JSON_UNESCAPED_UNICODE),
                'tagConf'   => json_encode($tagConf, JSON_UNESCAPED_UNICODE),
                'updateTime'=> time(),
            ];

            // 开启事务
            Db::startTrans();
            try {
                // 更新数据
                $result = Db::name('customer_acquisition_task')
                    ->where('id', $params['planId'])
                    ->update($data);
                
                if ($result === false) {
                    throw new \Exception('更新计划失败');
                }

                // 提交事务
                Db::commit();
                
                return ResponseHelper::success(['planId' => $params['planId']], '更新计划任务成功');
                
            } catch (\Exception $e) {
                // 回滚事务
                Db::rollback();
                throw $e;
            }
            
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }
} 