<?php

namespace app\cunkebao\controller\plan;

use library\ResponseHelper;
use think\Controller;
use think\Db;

/**
 * 对外API接口控制器
 */
class PostExternalApiV1Controller extends Controller
{
    /**
     * 验证签名
     *
     * @param array $params 请求参数
     * @param string $apiKey API密钥
     * @param string $sign 签名
     * @return bool
     */
    private function validateSign($params, $apiKey, $sign)
    {
        // 1. 从参数中移除sign和apiKey
        unset($params['sign'], $params['apiKey'],$params['portrait']);
        
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
        $expectedSign = md5($firstMd5 . $apiKey);
        
        // 7. 比对签名
        return $expectedSign === $sign;
    }

    /**
     * 对外API接口入口
     *
     * @return \think\response\Json
     */
    public function index()
    {
        try {
            $params = $this->request->param();
            
            // 验证必填参数
            if (empty($params['apiKey'])) {
                return ResponseHelper::error('apiKey不能为空', 400);
            }
            
            if (empty($params['sign'])) {
                return ResponseHelper::error('sign不能为空', 400);
            }
            
            if (empty($params['timestamp'])) {
                return ResponseHelper::error('timestamp不能为空', 400);
            }

            // 验证时间戳（允许5分钟误差）
            if (abs(time() - intval($params['timestamp'])) > 300) {
                return ResponseHelper::error('请求已过期', 400);
            }

            // 查询API密钥是否存在
            $plan = Db::name('customer_acquisition_task')
                ->where('apiKey', $params['apiKey'])
                ->where('status', 1)
                ->find();

            if (!$plan) {
                return ResponseHelper::error('无效的apiKey', 401);
            }

            // 验证签名
            if (!$this->validateSign($params,$params['apiKey'], $params['sign'])) {
                return ResponseHelper::error('签名验证失败', 401);
            }

            $identifier = !empty($params['wechatId']) ? $params['wechatId'] : $params['phone'];


            $trafficPool = Db::name('traffic_pool')->where('identifier', $identifier)->find();
            if (!$trafficPool) {
                $trafficPoolId =Db::name('traffic_pool')->insertGetId([
                    'identifier' => $identifier,
                    'mobile' => $params['phone']
                ]);
            }else{
                $trafficPoolId = $trafficPool['id'];
            }
          
            $taskCustomer = Db::name('task_customer')->where('task_id', $plan['id'])->where('phone', $identifier)->find();
           
            // 处理用户画像
            if(!empty($params['portrait']) && is_array($params['portrait'])){
              $this->updatePortrait($params['portrait'],$trafficPoolId);
            }
            if (!$taskCustomer) {
                $tags = !empty($params['tags']) ?  explode(',',$params['tags']) : [];
                Db::name('task_customer')->insert([
                    'task_id' => $plan['id'],
                    'phone' => $identifier,
                    'name' =>  !empty($params['name']) ? $params['name'] : '',
                    'source' => !empty($params['source']) ? $params['source'] : '',
                    'remark' => !empty($params['remark']) ? $params['remark'] : '',
                    'tags' => json_encode($tags,256),
                ]);

                return json([
                    'code' => 200,
                    'message' => '新增成功',
                    'data' => $identifier
                ]);
            }else{
                return json([
                    'code' => 200,
                    'message' => '已存在',
                    'data' => $identifier
                ]);
            }
        } catch (\Exception $e) {
            return ResponseHelper::error('系统错误: ' . $e->getMessage(), 500);
        }
    }



    /**
     * 用户画像
     * @param array $data 用户画像数据
     * @param int $trafficPoolId 流量池id
     */
    public function updatePortrait($data,$trafficPoolId)
    {
        if(empty($data) || empty($trafficPoolId) || !is_array($data)){
            return;
        }

        $type = !empty($data['type']) ? $data['type'] : 0;
        $source = !empty($data['source']) ? $data['source'] : 0;
        $sourceId = !empty($data['sourceId']) ? $data['sourceId'] : 0;
        $remark = !empty($data['remark']) ? $data['remark'] : '';

        $data = [
            'trafficPoolId' => $trafficPoolId,
            'type' => $type,
            'source' => $source,
            'sourceId' => $sourceId,
            'remark' => $remark,
            'count' => 1,
            'createTime' => time(),
            'updateTime' => time(),
        ];

        $res= Db::name('user_portrait')
        ->where(['trafficPoolId'=>$trafficPoolId,'type'=>$type,'source'=>$source,'sourceId'=>$sourceId])
        ->where('createTime','>',time()-1800)
        ->find();
        if($res){
            $count = $res['count'] + 1;
            Db::name('user_portrait')->where(['id'=>$res['id']])->update(['count'=>$count,'updateTime'=>time()]);
        }else{
            Db::name('user_portrait')->insert($data);
        }

    }
} 