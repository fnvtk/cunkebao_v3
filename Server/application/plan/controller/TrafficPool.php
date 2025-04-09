<?php
namespace app\plan\controller;

use think\Controller;
use think\facade\Request;
use app\plan\model\TrafficPool as TrafficPoolModel;
use app\plan\model\TrafficSource;

/**
 * 流量池控制器
 */
class TrafficPool extends Controller
{
    /**
     * 导入订单标签
     * 
     * @return \think\response\Json
     */
    public function importOrders()
    {
        try {
            // 获取请求数据
            $data = Request::post();
            
            // 验证必要字段
            if (empty($data['mobile']) || empty($data['from']) || empty($data['sceneId'])) {
                return json([
                    'code' => 400,
                    'msg' => '缺少必要参数'
                ]);
            }
            
            // 批量处理数据
            $successCount = 0;
            $failCount = 0;
             
            foreach ($data['mobile'] as $index => $mobile) {
                // 导入到流量池
                $poolData[] = [
                    'mobile' => $mobile,
                    'from' => $data['from'][$index] ?? '',
                    'createTime' => time()
                ];

                // 导入到流量来源
                $sourceData[] = [
                    'mobile' => $mobile,
                    'sceneId' => $data['sceneId'],
                    'createTime' => time()
                ];
            }

            new

            return json([
                'code' => 200,
                'msg' => '导入完成',
                'data' => [
                    'success' => $successCount,
                    'fail' => $failCount
                ]
            ]);
            
        } catch (\Exception $e) {
            return json([
                'code' => 500,
                'msg' => '导入失败：' . $e->getMessage()
            ]);
        }
    }
} 