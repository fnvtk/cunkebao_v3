<?php

namespace app\cunkebao\controller\plan;

use library\ResponseHelper;
use think\Controller;
use think\Db;
use think\facade\Request;

/**
 * 获客场景控制器
 */
class PostCreateAddFriendPlanV1Controller extends Controller
{

    protected function yyyyyyy()
    {

    }

    /**
     * 生成唯一API密钥
     * 
     * @return string
     */
    private function generateApiKey()
    {
        // 生成5组随机字符串，每组5个字符
        $chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        $apiKey = '';
        
        for ($i = 0; $i < 5; $i++) {
            $segment = '';
            for ($j = 0; $j < 5; $j++) {
                $segment .= $chars[mt_rand(0, strlen($chars) - 1)];
            }
            $apiKey .= ($i > 0 ? '-' : '') . $segment;
        }
        
        // 检查是否已存在
        $exists = Db::name('customer_acquisition_task')
            ->where('apiKey', $apiKey)
            ->find();
            
        if ($exists) {
            // 如果已存在，递归重新生成
            return $this->generateApiKey();
        }
        
        return $apiKey;
    }

    /**
     * 添加计划任务
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->param();
            
            // 验证必填字段
            if (empty($params['planName'])) {
                return ResponseHelper::error('计划名称不能为空', 400);
            }
            
            if (empty($params['scenario'])) {
                return ResponseHelper::error('场景ID不能为空', 400);
            }
            
            if (empty($params['device'])) {
                return ResponseHelper::error('请选择设备', 400);
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
                $sceneConf['planName'],
                $sceneConf['scenario'],
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

            // 构建数据
            $data = [
                'name'      => $params['planName'],
                'sceneId'   => $params['scenario'],
                'sceneConf' => json_encode($sceneConf, JSON_UNESCAPED_UNICODE),
                'reqConf'   => json_encode($reqConf, JSON_UNESCAPED_UNICODE),
                'msgConf'   => json_encode($msgConf, JSON_UNESCAPED_UNICODE),
                'tagConf'   => json_encode($tagConf, JSON_UNESCAPED_UNICODE),
                'userId'    => $params['userInfo']['id'] ?? 0,
                'companyId' => $params['userInfo']['companyId'] ?? 0,
                'status'    => 1,
                'apiKey'    => $this->generateApiKey(), // 生成API密钥
                'createTime'=> time(),
                'updateTime'=> time(),
            ];

        

            // 开启事务
            Db::startTrans();
            try {
                // 插入数据
                $planId = Db::name('customer_acquisition_task')->insertGetId($data);
                
                if (!$planId) {
                    throw new \Exception('添加计划失败');
                }

                // 提交事务
                Db::commit();
                
                return ResponseHelper::success(['planId' => $planId], '添加计划任务成功');
                
            } catch (\Exception $e) {
                // 回滚事务
                Db::rollback();
                throw $e;
            }
            
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }

        /**
     * 验证JSON格式是否正确
     *
     * @param string $string
     * @return bool
     */
    private function validateJson($string)
    {
        if (empty($string)) {
            return true;
        }
        
        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }
} 