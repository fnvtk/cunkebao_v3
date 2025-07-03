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
            if (empty($params['name'])) {
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

            // 构建数据
            $data = [
                'name'      => $params['name'],
                'sceneId'   => $params['sceneId'],
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


                //订单
                if($params['sceneId'] == 2){
                    if(!empty($params['orderTableFile'])){
                        // 先下载到本地临时文件，再分析，最后删除
                        $originPath = $params['orderTableFile'];
                        $tmpFile = tempnam(sys_get_temp_dir(), 'order_');
                        // 判断是否为远程文件
                        if (preg_match('/^https?:\/\//i', $originPath)) {
                            // 远程URL，下载到本地
                            $fileContent = file_get_contents($originPath);
                            if ($fileContent === false) {
                                exit('远程文件下载失败: ' . $originPath);
                            }
                            file_put_contents($tmpFile, $fileContent);
                        } else {
                            // 本地文件，直接copy
                            if (!file_exists($originPath)) {
                                exit('文件不存在: ' . $originPath);
                            }
                            copy($originPath, $tmpFile);
                        }
                        // 解析临时文件
                        $ext = strtolower(pathinfo($originPath, PATHINFO_EXTENSION));
                        $rows = [];
                        if (in_array($ext, ['xls', 'xlsx'])) {
                            // 直接用composer自动加载的PHPExcel
                            $excel = \PHPExcel_IOFactory::load($tmpFile);
                            $sheet = $excel->getActiveSheet();
                            $data = $sheet->toArray();
                            if (count($data) > 1) {
                                array_shift($data); // 去掉表头
                            }
                            foreach ($data as $cols) {
                                if (count($cols) >= 6) {
                                    $rows[] = [
                                        'name'        => trim($cols[0]),
                                        'phone'       => trim($cols[1]),
                                        'wechat'      => trim($cols[2]),
                                        'source'      => trim($cols[3]),
                                        'orderAmount' => trim($cols[4]),
                                        'orderDate'   => trim($cols[5]),
                                    ];
                                }
                            }
                        } elseif ($ext === 'csv') {
                            $content = file_get_contents($tmpFile);
                            $lines = preg_split('/\r\n|\r|\n/', $content);
                            if (count($lines) > 1) {
                                array_shift($lines); // 去掉表头
                                foreach ($lines as $line) {
                                    if (trim($line) === '') continue;
                                    $cols = str_getcsv($line);
                                    if (count($cols) >= 6) {
                                        $rows[] = [
                                            'name'        => trim($cols[0]),
                                            'phone'       => trim($cols[1]),
                                            'wechat'      => trim($cols[2]),
                                            'source'      => trim($cols[3]),
                                            'orderAmount' => trim($cols[4]),
                                            'orderDate'   => trim($cols[5]),
                                        ];
                                    }
                                }
                            }
                        } else {
                            unlink($tmpFile);
                            exit('暂不支持的文件类型: ' . $ext);
                        }
                        // 删除临时文件
                        unlink($tmpFile);

                        foreach($rows as $row){
                            $phone = !empty($row['phone']) ? $row['phone'] : $row['wechat'];
                            if(empty($phone)){
                                continue;
                            }
                            $ck_task_customer = Db::name('task_customer')
                            ->where(['phone' => $phone,'task_id' => $planId])
                            ->find();
                            if(!$ck_task_customer){
                                $task_customer = Db::name('task_customer')
                                ->insert([
                                    'task_id' => $planId,
                                    'name' => $row['name'] ?? '',
                                    'source' => $row['source'] ?? '',
                                    'phone' => $phone,
                                    'tags' => json_encode([],JSON_UNESCAPED_UNICODE),
                                    'siteTags' => json_encode([],JSON_UNESCAPED_UNICODE),
                                    'created_at' => time(),
                                ]);
                            }
                        }
                       
                    }
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