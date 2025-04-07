<?php
namespace app\plan\service;

use app\plan\model\TrafficPool;
use app\plan\model\TrafficSource;
use app\plan\model\PlanScene;
use think\Exception;
use think\facade\Log;

/**
 * 场景处理服务
 */
class SceneHandler
{
    /**
     * 获取场景处理器
     * @param int $sceneId 场景ID
     * @return object 场景处理器
     */
    public static function getHandler($sceneId)
    {
        $scene = PlanScene::getSceneInfo($sceneId);
        if (empty($scene)) {
            throw new Exception('场景不存在');
        }
        
        $handlerMap = [
            // 场景ID => 处理器名称
            1 => 'PosterScene',
            2 => 'OrderScene',
            3 => 'DouyinScene',
            4 => 'XiaohongshuScene',
            5 => 'PhoneScene',
            6 => 'WechatScene',
            7 => 'GroupScene',
            8 => 'PaymentScene',
            9 => 'ApiScene',
        ];
        
        if (!isset($handlerMap[$sceneId])) {
            throw new Exception('未找到场景处理器');
        }
        
        $handlerClass = '\\app\\plan\\scene\\' . $handlerMap[$sceneId];
        if (!class_exists($handlerClass)) {
            throw new Exception('场景处理器不存在');
        }
        
        return new $handlerClass($scene);
    }
    
    /**
     * 处理海报扫码获客
     * @param string $mobile 手机号
     * @param int $sceneId 场景ID
     * @param int $planId 计划ID
     * @param array $extra 额外数据
     * @return array 处理结果
     */
    public static function handlePosterScan($mobile, $sceneId, $planId = null, $extra = [])
    {
        if (empty($mobile)) {
            return [
                'success' => false,
                'message' => '手机号不能为空'
            ];
        }
        
        try {
            // 添加或更新流量信息
            $trafficId = TrafficPool::addOrUpdateTraffic($mobile, [
                'name' => $extra['name'] ?? '',
                'gender' => $extra['gender'] ?? 0,
                'region' => $extra['region'] ?? ''
            ]);
            
            // 添加流量来源记录
            TrafficSource::addSource($trafficId, 'poster', [
                'plan_id' => $planId,
                'scene_id' => $sceneId,
                'source_detail' => json_encode($extra)
            ]);
            
            return [
                'success' => true,
                'message' => '海报扫码获客处理成功',
                'data' => [
                    'traffic_id' => $trafficId
                ]
            ];
            
        } catch (Exception $e) {
            Log::error('海报扫码获客处理失败', [
                'mobile' => $mobile,
                'scene_id' => $sceneId,
                'plan_id' => $planId,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => '处理失败：' . $e->getMessage()
            ];
        }
    }
    
    /**
     * 处理订单导入获客
     * @param array $orders 订单数据
     * @param int $sceneId 场景ID
     * @param int $planId 计划ID
     * @return array 处理结果
     */
    public static function handleOrderImport($orders, $sceneId, $planId = null)
    {
        if (empty($orders) || !is_array($orders)) {
            return [
                'success' => false,
                'message' => '订单数据格式不正确'
            ];
        }
        
        $success = 0;
        $failed = 0;
        $errors = [];
        
        foreach ($orders as $order) {
            if (empty($order['mobile'])) {
                $failed++;
                $errors[] = '订单缺少手机号';
                continue;
            }
            
            try {
                // 添加或更新流量信息
                $trafficId = TrafficPool::addOrUpdateTraffic($order['mobile'], [
                    'name' => $order['name'] ?? '',
                    'gender' => $order['gender'] ?? 0,
                    'region' => $order['region'] ?? ''
                ]);
                
                // 添加流量来源记录
                TrafficSource::addSource($trafficId, 'order', [
                    'plan_id' => $planId,
                    'scene_id' => $sceneId,
                    'source_detail' => json_encode($order),
                    'sub_channel' => $order['order_source'] ?? ''
                ]);
                
                $success++;
                
            } catch (Exception $e) {
                $failed++;
                $errors[] = '处理订单失败：' . $e->getMessage();
                
                Log::error('订单导入获客处理失败', [
                    'order' => $order,
                    'scene_id' => $sceneId,
                    'plan_id' => $planId,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        return [
            'success' => $success > 0,
            'message' => "导入完成，成功{$success}条，失败{$failed}条",
            'data' => [
                'success_count' => $success,
                'failed_count' => $failed,
                'errors' => $errors
            ]
        ];
    }
    
    /**
     * 通用渠道获客处理
     * @param string $mobile 手机号
     * @param string $channel 渠道
     * @param int $sceneId 场景ID
     * @param int $planId 计划ID
     * @param array $extra 额外数据
     * @return array 处理结果
     */
    public static function handleChannelTraffic($mobile, $channel, $sceneId, $planId = null, $extra = [])
    {
        if (empty($mobile)) {
            return [
                'success' => false,
                'message' => '手机号不能为空'
            ];
        }
        
        if (empty($channel)) {
            return [
                'success' => false,
                'message' => '渠道不能为空'
            ];
        }
        
        try {
            // 添加或更新流量信息
            $trafficId = TrafficPool::addOrUpdateTraffic($mobile, [
                'name' => $extra['name'] ?? '',
                'gender' => $extra['gender'] ?? 0,
                'region' => $extra['region'] ?? ''
            ]);
            
            // 添加流量来源记录
            TrafficSource::addSource($trafficId, $channel, [
                'plan_id' => $planId,
                'scene_id' => $sceneId,
                'source_detail' => json_encode($extra),
                'sub_channel' => $extra['sub_channel'] ?? ''
            ]);
            
            return [
                'success' => true,
                'message' => $channel . '获客处理成功',
                'data' => [
                    'traffic_id' => $trafficId
                ]
            ];
            
        } catch (Exception $e) {
            Log::error($channel . '获客处理失败', [
                'mobile' => $mobile,
                'scene_id' => $sceneId,
                'plan_id' => $planId,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => '处理失败：' . $e->getMessage()
            ];
        }
    }
} 