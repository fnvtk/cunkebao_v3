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
     * 生成签名
     * 
     * @param array $params 参数数组
     * @param string $apiKey API密钥
     * @return string
     */
    private function generateSignature($params, $apiKey)
    {
        // 1. 移除sign和apiKey
        unset($params['sign'], $params['apiKey']);
        
        // 2. 移除空值
        $params = array_filter($params, function($value) {
            return !is_null($value) && $value !== '';
        });
        
        // 3. 参数按键名升序排序
        ksort($params);
        
        // 4. 直接拼接参数值
        $stringToSign = implode('', array_values($params));
        
        // 5. 第一次MD5加密
        $firstMd5 = md5($stringToSign);
        
        // 6. 拼接apiKey并第二次MD5加密
        return md5($firstMd5 . $apiKey);
    }

    /**
     * 生成测试URL
     *
     * @param string $apiKey API密钥
     * @return array
     */
    public function testUrl($apiKey)
    {
        try {
            if (empty($apiKey)) {
                return [];
            }

            // 构建测试参数
            $testParams = [
                'name' => '测试客户',
                'phone' => '18888888888',
                'apiKey' => $apiKey,
                'timestamp' => time()
            ];

            // 生成签名
            $sign = $this->generateSignature($testParams, $apiKey);
            $testParams['sign'] = $sign;

            // 构建签名过程说明
            $signParams = $testParams;
            unset($signParams['sign'], $signParams['apiKey']);
            ksort($signParams);
            $signStr = implode('', array_values($signParams));

            // 构建完整URL参数，不对中文进行编码
            $urlParams = [];
            foreach ($testParams as $key => $value) {
                $urlParams[] = $key . '=' . $value;
            }
            $fullUrl = implode('&', $urlParams);

            return [
                'apiKey' => $apiKey,
                'originalString' => $signStr,
                'sign' => $sign,
                'fullUrl' => $fullUrl
            ];

        } catch (\Exception $e) {
            return [];
        }
    }

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
            $msgConf = json_decode($plan['msgConf'], true) ?: [];
            $tagConf = json_decode($plan['tagConf'], true) ?: [];

            // 合并数据
            $newData['messagePlans'] = $msgConf;
            $newData = array_merge($newData, $sceneConf, $reqConf, $tagConf, $plan);
            
            // 移除不需要的字段
            unset(
                $newData['sceneConf'],
                $newData['reqConf'],
                $newData['msgConf'],
                $newData['tagConf'],
                $newData['userInfo'],
                $newData['createTime'],
                $newData['updateTime'],
                $newData['deleteTime']
            );
            
            // 生成测试URL
            $newData['textUrl'] = $this->testUrl($newData['apiKey']);

            return ResponseHelper::success($newData, '获取计划详情成功');
            
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }
} 